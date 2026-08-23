/**
 * Monster teams for a maze — rolled ONCE at dungeon creation and stored on the
 * dungeon row, so every player faces the same composition.
 *
 * The layout marks monster spots as keyless, non-stair doors (see
 * {@link DungeonDoor}); each spot gets a team drawn from the dungeon's pool
 * (Dungeon.monsterPool) whose total level approximates the maze level.
 */

import type { DungeonStruct } from './types.js';
import { Monster, monsterList } from '@drpg/core/models/fight/MonsterList';

export interface MonsterTeam {
	l: number;
	x: number;
	y: number;
	monsters: Monster[];
}

/** Draw monsters from `pool` until their total level reaches ~`level`. */
function rollTeam(pool: Monster[], level: number): Monster[] {
	const team: Monster[] = [];
	let budget = level;
	// ponytail: cap of 5 mirrors a regular fight pack; tune if fights allow more.
	while (team.length < 5) {
		const fits = pool.filter(m => monsterList[m].level <= budget);
		if (fits.length === 0) break;
		const pick = fits[Math.floor(Math.random() * fits.length)];
		team.push(pick);
		budget -= monsterList[pick].level;
	}
	if (team.length === 0) {
		// Every pool monster outlevels the maze: field the weakest one alone.
		team.push([...pool].sort((a, b) => monsterList[a].level - monsterList[b].level)[0]);
	}
	return team;
}

/** Roll a team for every monster door in the layout. */
export function rollMonsters(d: DungeonStruct, pool: Monster[], level: number): MonsterTeam[] {
	if (pool.length === 0) return [];
	const out: MonsterTeam[] = [];
	d.levels.forEach((lvl, l) => {
		for (const room of lvl.rooms) {
			for (const door of room.doors) {
				if (door.up !== null || door.key !== null) continue;
				out.push({ l, x: door.x, y: door.y, monsters: rollTeam(pool, level) });
			}
		}
	});
	return out;
}
