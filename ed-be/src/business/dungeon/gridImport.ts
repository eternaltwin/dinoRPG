/**
 * gridImport — converts the admin dungeon-builder grid (DungeonGrid, a plain
 * per-level floor/door/item description) into a codec-ready DungeonStruct.
 *
 * The codec imposes shapes the editor should not know about: room w/h are
 * encoded with one bit less than coordinates (so rooms are smaller than the
 * map), a room holds at most one item and 31 doors, and floor cells outside
 * every room rect are lost. We therefore tile each level into chunk rooms
 * covering the grid, spill doors across them, and give every item its own
 * 1×1 room — all consumers match doors/items by absolute x/y, so room
 * membership is storage only.
 */

import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import type { DungeonGrid, DungeonGridLevel } from '@drpg/core/models/dungeon/DungeonEditor';
import type { DungeonScenario } from '@drpg/core/models/dungeon/DungeonList';
import { itemList } from '@drpg/core/models/item/ItemList';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { DungeonCodec } from './DungeonCodec.js';
import type { DungeonDoor, DungeonLevel, DungeonRoom, DungeonStruct } from './types.js';

const MAX_DOORS_PER_ROOM = 31; // 5-bit count in the codec, unchecked by encode()

function fail(msg: string): never {
	throw new ExpectedError(`Invalid dungeon grid: ${msg}`);
}

function checkInt(v: unknown, min: number, max: number, what: string): number {
	if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
		fail(`${what} must be an integer in [${min}, ${max}], got ${JSON.stringify(v)}`);
	}
	return v;
}

/**
 * Validate the builder's scenario list (what each chest/scroll item shows and
 * grants) into storable DungeonScenario[]. Texts are raw, not i18n keys.
 */
export function checkScenarios(raw: unknown): DungeonScenario[] {
	if (raw == null) return [];
	if (!Array.isArray(raw) || raw.length > 64) fail('scenarios must be an array of at most 64 entries');
	return raw.map((s, i) => {
		if (typeof s?.text !== 'string' || s.text.trim() === '') fail(`scenario ${i} needs a text`);
		if (s.icon != null && s.icon !== 'scroll' && s.icon !== 'chest') fail(`scenario ${i} icon must be scroll or chest`);
		if (s.obj != null && !(s.obj in itemList)) fail(`scenario ${i} grants an unknown item`);
		if (s.count != null) checkInt(s.count, 1, 999, `scenario ${i} count`);
		if (s.collec != null && !(s.collec in rewardList)) fail(`scenario ${i} grants an unknown reward`);
		return { text: s.text.trim(), icon: s.icon, obj: s.obj, count: s.count, collec: s.collec };
	});
}

export function structFromGrid(g: DungeonGrid): DungeonStruct {
	const width = checkInt(g?.width, 8, 64, 'width');
	const height = checkInt(g?.height, 8, 64, 'height');
	if (!Array.isArray(g.levels) || g.levels.length < 1 || g.levels.length > 10) fail('levels must be 1 to 10 floors');

	// Per-level floor lookup + one-entity-per-cell bookkeeping.
	const floors: boolean[][][] = []; // [l][x][y]
	const used: Set<string>[] = [];
	g.levels.forEach((lvl: DungeonGridLevel, l: number) => {
		if (!Array.isArray(lvl.floor) || lvl.floor.length !== height) fail(`level ${l} floor must have ${height} rows`);
		const t: boolean[][] = [];
		for (let x = 0; x < width; x++) t[x] = new Array<boolean>(height).fill(false);
		lvl.floor.forEach((row, y) => {
			if (typeof row !== 'string' || row.length !== width || /[^01]/.test(row)) {
				fail(`level ${l} row ${y} must be ${width} chars of 0/1`);
			}
			for (let x = 0; x < width; x++) t[x][y] = row[x] === '1';
		});
		floors.push(t);
		used.push(new Set());
	});

	const onFloor = (l: number, x: number, y: number, what: string) => {
		checkInt(l, 0, g.levels.length - 1, `${what} level`);
		checkInt(x, 0, width - 1, `${what} x`);
		checkInt(y, 0, height - 1, `${what} y`);
		if (!floors[l][x][y]) fail(`${what} at (${x},${y}) level ${l} is not on a floor cell`);
	};
	const claim = (l: number, x: number, y: number, what: string) => {
		const k = `${x},${y}`;
		if (used[l].has(k)) fail(`${what} at (${x},${y}) level ${l} overlaps another entity`);
		used[l].add(k);
	};

	g.levels.forEach((lvl, l) => {
		if (!Array.isArray(lvl.doors) || !Array.isArray(lvl.items)) fail(`level ${l} needs doors and items arrays`);
		for (const d of lvl.doors) {
			onFloor(l, d.x, d.y, 'door');
			claim(l, d.x, d.y, 'door');
			if (d.up === true && l + 1 >= g.levels.length) fail(`stair up at (${d.x},${d.y}) level ${l} has no level above`);
			if (d.up === false && l === 0) fail(`stair down at (${d.x},${d.y}) level 0 has no level below`);
			if (d.up != null && d.key != null) fail(`stair at (${d.x},${d.y}) level ${l} cannot carry a key`);
			if (d.key != null) checkInt(d.key, 0, 63, 'door key');
		}
		for (const it of lvl.items) {
			onFloor(l, it.x, it.y, 'item');
			claim(l, it.x, it.y, 'item');
			checkInt(it.k, 0, 3, 'item kind');
			checkInt(it.v, 0, it.k === 0 ? 63 : 255, 'item value'); // IKey v feeds the 6-bit door key field
		}
	});

	onFloor(g.start?.l, g.start?.x, g.start?.y, 'start');
	claim(g.start.l, g.start.x, g.start.y, 'start');
	onFloor(g.exit?.l, g.exit?.x, g.exit?.y, 'exit');
	claim(g.exit.l, g.exit.x, g.exit.y, 'exit');

	// Chunk rooms: the largest rect the codec can encode for this map size.
	const chunk = (1 << (DungeonCodec.nbits(Math.max(width, height)) - 1)) - 1;
	let rid = 0;
	const levels: DungeonLevel[] = g.levels.map((lvl, l) => {
		const table = floors[l];
		const rooms: DungeonRoom[] = [];
		for (let cx = 0; cx < width; cx += chunk) {
			for (let cy = 0; cy < height; cy += chunk) {
				const w = Math.min(chunk, width - cx);
				const h = Math.min(chunk, height - cy);
				let hasFloor = false;
				for (let x = cx; x < cx + w && !hasFloor; x++) {
					for (let y = cy; y < cy + h; y++) {
						if (table[x][y]) {
							hasFloor = true;
							break;
						}
					}
				}
				if (hasFloor) rooms.push({ id: rid++, x: cx, y: cy, w, h, doors: [], item: null });
			}
		}
		// Spill doors across chunk rooms; overflow gets its own 1×1 room.
		const doors: DungeonDoor[] = lvl.doors.map(d => ({ x: d.x, y: d.y, up: d.up ?? null, key: d.key ?? null }));
		for (const door of doors) {
			const host = rooms.find(r => r.doors.length < MAX_DOORS_PER_ROOM);
			if (host) host.doors.push(door);
			else rooms.push({ id: rid++, x: door.x, y: door.y, w: 1, h: 1, doors: [door], item: null });
		}
		// One item per room max: every item rides its own 1×1 room.
		for (const it of lvl.items) {
			rooms.push({ id: rid++, x: it.x, y: it.y, w: 1, h: 1, doors: [], item: { x: it.x, y: it.y, k: it.k, v: it.v } });
		}
		return { table, rooms };
	});

	return {
		width,
		height,
		levels,
		start: { x: g.start.x, y: g.start.y, l: g.start.l },
		exit: { x: g.exit.x, y: g.exit.y, l: g.exit.l }
	};
}
