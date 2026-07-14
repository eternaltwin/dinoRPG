/**
 * Monster packs for a dungeon run.
 *
 * The layout marks monster spots as keyless, non-stair doors (see
 * {@link DungeonDoor}); at run creation each spot gets a monster rolled from
 * the dungeon's pool. The result is stored as JSON on the run row.
 */

import type { DungeonStruct } from './types.js';
import { Monster } from '@drpg/core/models/fight/MonsterList';

export interface RunMonster {
	l: number;
	x: number;
	y: number;
	monster: Monster;
	defeated: boolean;
}

/** Assign a random monster from `pool` to every monster door in the layout. */
export function rollMonsters(d: DungeonStruct, pool: Monster[]): RunMonster[] {
	const out: RunMonster[] = [];
	d.levels.forEach((level, l) => {
		for (const room of level.rooms) {
			for (const door of room.doors) {
				if (door.up !== null || door.key !== null) continue;
				out.push({ l, x: door.x, y: door.y, monster: pool[Math.floor(Math.random() * pool.length)], defeated: false });
			}
		}
	});
	return out;
}
