/**
 * Checker — TypeScript port of `dungeon/dungeon/gen/Checker.hx`.
 *
 * Verifies the dungeon is solvable: starting from `start`, repeatedly flood the
 * reachable rooms, collecting any keys found; if that unlocks new doors, flood
 * again. Fails if the exit can never be reached, or if some room stays
 * unreachable even once the exit is.
 */

import { DungeonItem } from '../types.js';
import type { LevelInfos, Room } from './Data.js';

export class Checker {
	private keys: boolean[] = [];
	private visitedRooms: Room[] = [];

	private getRoom(inf: LevelInfos, pos: { l: number; x: number; y: number }): Room {
		for (const r of inf.levels[pos.l].rooms) if (pos.x >= r.x && pos.y >= r.y && pos.x < r.x2 && pos.y < r.y2) return r;
		throw new Error("can't find start/exit");
	}

	check(inf: LevelInfos): string | null {
		const r0 = this.getRoom(inf, inf.start);
		const rexit = this.getRoom(inf, inf.exit);
		// eslint-disable-next-line no-constant-condition
		while (true) {
			for (const l of inf.levels) for (const r of l.rooms) r.tmp = 0;
			this.visitedRooms = [];
			this.loop(r0);
			if (rexit.tmp !== 0) {
				for (const l of inf.levels) for (const r of l.rooms) if (r.tmp === 0) return 'Unreachable room';
				return null;
			}
			let locked = true;
			for (const r of this.visitedRooms)
				if (r.item != null && r.item.k === DungeonItem.IKey) {
					if (!this.keys[r.item.v]) {
						locked = false;
						this.keys[r.item.v] = true;
					}
				}
			if (locked) return 'Unreachable exit';
		}
	}

	private loop(r: Room): void {
		if (r.tmp !== 0) return;
		r.tmp = 1;
		this.visitedRooms.push(r);
		for (const d of r.doors) if (d.status === 0 || this.keys[d.status]) this.loop(d.other(r));
	}
}
