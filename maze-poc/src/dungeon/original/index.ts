/**
 * OriginalGenerator — orchestrates the ported `gfx/dungeon/gen` pipeline
 * (Rooms → Noise → Gameplay → Checker) and emits a {@link DungeonStruct},
 * mirroring `Main.loop` + `Main.codeRoom` from the archive.
 *
 * Because the proprietary `mt.Rand` is substituted by {@link Rand}, a given seed
 * produces a different — but structurally faithful and solvable — dungeon than
 * the historical client. Generation may fail for a seed (surface too small,
 * unsolvable, …); we retry with derived seeds, exactly as the original retried.
 */

import type { DungeonStruct, DungeonRoom, DungeonItemPlacement, DungeonItem } from '../types';
import { LevelInfos, Level, Room } from './Data';
import { Rooms } from './Rooms';
import { Noise } from './Noise';
import { Gameplay } from './Gameplay';
import { Checker } from './Checker';

export interface OriginalOptions {
	width?: number;
	height?: number;
	levels?: number;
	/** Room-edge noise amount (0 disables). Archive default 0.2. */
	noise?: number;
	/** Noise erosion passes. Archive default 10. */
	filters?: number;
	/** Minimum covered-surface ratio. Archive default 0.3. */
	surface?: number;
	seed?: number;
	/** Max generation attempts before giving up. */
	maxAttempts?: number;
}

function codeRoom(r: Room): DungeonRoom {
	const doors: DungeonRoom['doors'] = [];
	for (const d of r.doors) {
		const r2 = d.other(r);
		const delta = (r2.level as Level).id - (r.level as Level).id;
		if (delta === 0 && r.id > r2.id) continue; // single traversal
		const up = delta === 0 ? null : delta > 0;
		const key = d.status === 0 ? null : d.status;
		if (up != null && key != null) throw new Error('assert');
		doors.push({ x: d.x, y: d.y, up, key });
	}
	const item: DungeonItemPlacement | null =
		r.item != null ? { x: r.item.x, y: r.item.y, k: r.item.k as DungeonItem, v: r.item.v } : null;
	return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, doors, item };
}

function toStruct(inf: LevelInfos): DungeonStruct {
	const levels = inf.levels.map(l => ({
		table: l.table,
		rooms: l.rooms.map(codeRoom)
	}));
	return {
		width: inf.width,
		height: inf.height,
		levels,
		start: { ...inf.start },
		exit: { ...inf.exit }
	};
}

/** Run the original pipeline once for an explicit seed, or return null on failure. */
function attempt(opts: Required<OriginalOptions>, seed: number): DungeonStruct | null {
	const inf = new LevelInfos(opts.width, opts.height, opts.levels);
	inf.noiseAmount = opts.noise;
	inf.filtersPasses = opts.filters;

	if (new Rooms(opts.surface).runOnce(inf, seed) != null) return null;
	new Noise().noise(inf);
	new Gameplay().gameplay(inf);
	if (new Checker().check(inf) != null) return null;
	return toStruct(inf);
}

export class OriginalGenerator {
	static generate(opts: OriginalOptions = {}): DungeonStruct {
		const resolved: Required<OriginalOptions> = {
			width: opts.width ?? 24,
			height: opts.height ?? 24,
			levels: opts.levels ?? 6,
			noise: opts.noise ?? 0.2,
			filters: opts.filters ?? 10,
			surface: opts.surface ?? 0.3,
			seed: opts.seed ?? (Math.random() * 0xffffff) >>> 0,
			maxAttempts: opts.maxAttempts ?? 200
		};

		let seed = resolved.seed >>> 0 || 1;
		for (let i = 0; i < resolved.maxAttempts; i++) {
			try {
				const d = attempt(resolved, seed);
				if (d != null) return d;
			} catch {
				// asserts / dead-end exhaustion -> try the next seed
			}
			// derive the next seed deterministically
			seed = Math.imul(seed ^ (i + 1), 0x9e3779b1) >>> 0 || 1;
		}
		throw new Error(`OriginalGenerator: no valid dungeon after ${resolved.maxAttempts} attempts`);
	}
}
