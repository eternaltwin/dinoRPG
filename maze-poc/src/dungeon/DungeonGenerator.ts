/**
 * DungeonGenerator
 * ----------------
 * Builds a valid {@link DungeonStruct} (the thing `DungeonCodec` encodes).
 *
 * The historical DinoRPG dungeons were generated server-side and shipped to the
 * client as pre-encoded strings; that generator is not part of the public
 * archive. This is an original generator that produces structures the ported
 * codec round-trips and the renderer can draw:
 *
 *   - the map is a grid of rectangular rooms separated by 1-cell walls,
 *   - a randomised depth-first "recursive backtracker" carves a perfect maze
 *     over that room grid (every room reachable, spanning tree of doors),
 *   - a few extra doors add loops,
 *   - one locked door + matching key, plus gold / heal chests,
 *   - multiple levels are stitched together with up/down stair doors.
 */

import { DungeonItem } from './types';
import type { DungeonStruct, DungeonLevel, DungeonRoom, DungeonDoor } from './types';

export interface GenerateOptions {
	width?: number;
	height?: number;
	levels?: number;
	roomsX?: number;
	roomsY?: number;
	seed?: number;
	/** Fraction of non-tree adjacencies turned into extra doors (loops). 0..1. */
	loopChance?: number;
}

/** Small deterministic PRNG so a given seed always yields the same dungeon. */
function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

interface Grid {
	cellW: number;
	cellH: number;
	roomsX: number;
	roomsY: number;
}

/** Top-left + size of the room sitting at grid coordinate (gx, gy). */
function roomRect(grid: Grid, gx: number, gy: number) {
	const x = gx * grid.cellW + 1;
	const y = gy * grid.cellH + 1;
	const w = grid.cellW - 1;
	const h = grid.cellH - 1;
	return { x, y, w, h };
}

function roomCenter(grid: Grid, gx: number, gy: number) {
	const r = roomRect(grid, gx, gy);
	return { x: r.x + (r.w >> 1), y: r.y + (r.h >> 1) };
}

export class DungeonGenerator {
	static generate(opts: GenerateOptions = {}): DungeonStruct {
		const width = opts.width ?? 41;
		const height = opts.height ?? 41;
		const nlevels = Math.max(1, opts.levels ?? 2);
		const roomsX = opts.roomsX ?? 5;
		const roomsY = opts.roomsY ?? 5;
		const loopChance = opts.loopChance ?? 0.12;
		const rng = mulberry32(opts.seed ?? (Math.random() * 0xffffffff) >>> 0);

		const grid: Grid = {
			roomsX,
			roomsY,
			cellW: Math.floor((width - 1) / roomsX),
			cellH: Math.floor((height - 1) / roomsY)
		};

		const levels: DungeonLevel[] = [];
		for (let l = 0; l < nlevels; l++) levels.push(DungeonGenerator.buildLevel(grid, width, height, rng, loopChance));

		// Stairs between consecutive levels, placed at a room shared by both
		// layouts (the grid is identical per level, so room centers line up).
		for (let l = 0; l < nlevels - 1; l++) {
			const gx = Math.floor(rng() * roomsX);
			const gy = Math.floor(rng() * roomsY);
			const c = roomCenter(grid, gx, gy);
			DungeonGenerator.roomAt(levels[l], grid, gx, gy).doors.push({ x: c.x, y: c.y, up: true, key: null });
			DungeonGenerator.roomAt(levels[l + 1], grid, gx, gy).doors.push({ x: c.x, y: c.y, up: false, key: null });
			levels[l].table[c.x][c.y] = true;
			levels[l + 1].table[c.x][c.y] = true;
		}

		// One key on level 0 and a locked door guarding the exit room.
		const keyRoom = DungeonGenerator.roomAt(levels[0], grid, Math.floor(rng() * roomsX), Math.floor(rng() * roomsY));
		const keyCenter = { x: keyRoom.x + (keyRoom.w >> 1), y: keyRoom.y + (keyRoom.h >> 1) };
		keyRoom.item = { x: keyCenter.x, y: keyCenter.y, k: DungeonItem.IKey, v: 0 };
		const lastLevel = levels[nlevels - 1];
		const exitDoor = DungeonGenerator.roomAt(lastLevel, grid, roomsX - 1, roomsY - 1).doors[0];
		if (exitDoor && exitDoor.up == null) exitDoor.key = 0; // turn a passage into a locked door

		// A couple of consumable chests for flavour.
		DungeonGenerator.placeChest(levels[0], grid, rng, DungeonItem.IGold, 50);
		DungeonGenerator.placeChest(lastLevel, grid, rng, DungeonItem.IHeal, 20);

		const start = roomCenter(grid, 0, 0);
		const exit = roomCenter(grid, roomsX - 1, roomsY - 1);

		return {
			width,
			height,
			levels,
			start: { x: start.x, y: start.y, l: 0 },
			exit: { x: exit.x, y: exit.y, l: nlevels - 1 }
		};
	}

	/** Build one level: rooms + a perfect maze of doors (plus a few loops). */
	private static buildLevel(
		grid: Grid,
		width: number,
		height: number,
		rng: () => number,
		loopChance: number
	): DungeonLevel {
		const table: boolean[][] = [];
		for (let x = 0; x < width; x++) table[x] = new Array<boolean>(height).fill(false);

		const rooms: DungeonRoom[] = [];
		let id = 0;
		for (let gy = 0; gy < grid.roomsY; gy++) {
			for (let gx = 0; gx < grid.roomsX; gx++) {
				const r = roomRect(grid, gx, gy);
				for (let x = r.x; x < r.x + r.w; x++) for (let y = r.y; y < r.y + r.h; y++) table[x][y] = true;
				rooms.push({ id: id++, x: r.x, y: r.y, w: r.w, h: r.h, doors: [], item: null });
			}
		}

		const idx = (gx: number, gy: number) => gy * grid.roomsX + gx;
		const visited = new Array<boolean>(grid.roomsX * grid.roomsY).fill(false);
		const carved = new Set<string>(); // "ax,ay-bx,by" canonical adjacency keys

		// Recursive backtracker (iterative) -> spanning tree of doors.
		const stack: [number, number][] = [[0, 0]];
		visited[idx(0, 0)] = true;
		while (stack.length > 0) {
			const [gx, gy] = stack[stack.length - 1];
			const neigh: [number, number][] = [];
			if (gx > 0 && !visited[idx(gx - 1, gy)]) neigh.push([gx - 1, gy]);
			if (gx < grid.roomsX - 1 && !visited[idx(gx + 1, gy)]) neigh.push([gx + 1, gy]);
			if (gy > 0 && !visited[idx(gx, gy - 1)]) neigh.push([gx, gy - 1]);
			if (gy < grid.roomsY - 1 && !visited[idx(gx, gy + 1)]) neigh.push([gx, gy + 1]);
			if (neigh.length === 0) {
				stack.pop();
				continue;
			}
			const [nx, ny] = neigh[Math.floor(rng() * neigh.length)];
			DungeonGenerator.carveDoor(grid, table, rooms[idx(gx, gy)], gx, gy, nx, ny);
			carved.add(DungeonGenerator.edgeKey(gx, gy, nx, ny));
			visited[idx(nx, ny)] = true;
			stack.push([nx, ny]);
		}

		// Extra doors to introduce loops.
		for (let gy = 0; gy < grid.roomsY; gy++) {
			for (let gx = 0; gx < grid.roomsX; gx++) {
				for (const [nx, ny] of [
					[gx + 1, gy],
					[gx, gy + 1]
				] as [number, number][]) {
					if (nx >= grid.roomsX || ny >= grid.roomsY) continue;
					if (carved.has(DungeonGenerator.edgeKey(gx, gy, nx, ny))) continue;
					if (rng() < loopChance) {
						DungeonGenerator.carveDoor(grid, table, rooms[idx(gx, gy)], gx, gy, nx, ny);
						carved.add(DungeonGenerator.edgeKey(gx, gy, nx, ny));
					}
				}
			}
		}

		return { table, rooms };
	}

	/** Punch a single-cell door in the wall between two grid-adjacent rooms. */
	private static carveDoor(
		grid: Grid,
		table: boolean[][],
		owner: DungeonRoom,
		ax: number,
		ay: number,
		bx: number,
		by: number
	): void {
		const a = roomRect(grid, ax, ay);
		let door: DungeonDoor;
		if (bx === ax + 1)
			door = { x: a.x + a.w, y: a.y + (a.h >> 1), up: null, key: null }; // wall to the right
		else if (bx === ax - 1) {
			const wallX = ax * grid.cellW; // shared wall column on the left
			door = { x: wallX, y: a.y + (a.h >> 1), up: null, key: null };
		} else if (by === ay + 1)
			door = { x: a.x + (a.w >> 1), y: a.y + a.h, up: null, key: null }; // wall below
		else {
			const wallY = ay * grid.cellH; // shared wall row above
			door = { x: a.x + (a.w >> 1), y: wallY, up: null, key: null };
		}
		table[door.x][door.y] = true;
		owner.doors.push(door);
	}

	private static placeChest(level: DungeonLevel, grid: Grid, rng: () => number, k: DungeonItem, v: number): void {
		const gx = Math.floor(rng() * grid.roomsX);
		const gy = Math.floor(rng() * grid.roomsY);
		const room = DungeonGenerator.roomAt(level, grid, gx, gy);
		if (room.item) return;
		const cx = room.x + (room.w >> 1);
		const cy = room.y + (room.h >> 1);
		room.item = { x: cx, y: cy, k, v };
	}

	private static roomAt(level: DungeonLevel, grid: Grid, gx: number, gy: number): DungeonRoom {
		return level.rooms[gy * grid.roomsX + gx];
	}

	private static edgeKey(ax: number, ay: number, bx: number, by: number): string {
		return ax < bx || ay < by ? `${ax},${ay}-${bx},${by}` : `${bx},${by}-${ax},${ay}`;
	}
}
