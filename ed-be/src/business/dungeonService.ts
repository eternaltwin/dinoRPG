/**
 * dungeonService — "pixy", the sole holder of the maze layout.
 *
 * The layout is generated here, encrypted (AES-256-GCM) before it touches the
 * database, and NEVER sent to the client. The client only ever receives the
 * fog-of-war reveals produced by its own validated moves, so a player cannot
 * solve the maze without exploring it.
 */

import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { DungeonCodec } from './dungeon/DungeonCodec.js';
import { Request } from 'express';
import { cellKey, cellsForKeys, revealAround } from './dungeon/reveal.js';
import type { MoveResult, RevealedCell, StartRunResult } from '@drpg/core/models/dungeon/DungeonClient';
import { DungeonItem } from './dungeon/types.js';
import type { DungeonDoor, DungeonStruct } from './dungeon/types.js';
import { unseal } from '../utils/dungeonCrypto.js';
import { createRun, findRun, getDungeonByName, updateRun, updateRunDefeated } from '../dao/dungeonRunDao.js';
import translate from '../utils/server/translate.js';
import { auth } from '../dao/playerDao.js';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import type { MonsterTeam } from './dungeon/monsters.js';
import {
	getDinozFicheLiteRequest,
	getDinozFightDataRequest,
	getFollowingDinoz,
	getLeaderWithFollowers,
	updateDinoz,
	updateMultipleDinoz
} from '../dao/dinozDao.js';
import { DungeonList } from '@drpg/core/models/dungeon/DungeonList';
import { UnavailableReason } from '@drpg/prisma/enums';
import { isAlive } from '@drpg/core/utils/DinozUtils';
import { calculateFightVsMonsters, rewardFightVsMonsters } from './fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { FightResult } from '@drpg/core/models/fight/FightResult';

/** Filter candidate reveals down to the not-yet-revealed ones and record them. */
function newReveals(candidates: RevealedCell[], revealed: Set<string>): RevealedCell[] {
	const out: RevealedCell[] = [];
	for (const c of candidates) {
		const k = cellKey(c.l, c.x, c.y);
		if (revealed.has(k)) continue;
		revealed.add(k);
		out.push(c);
	}
	return out;
}

/**
 * Strip the 'monster' icon from cells whose team this player already beat, and
 * tag the still-alive ones with the gfx name of their team's first monster.
 */
function decorateMonsters(reveal: RevealedCell[], teams: MonsterTeam[], defeated: string[]): RevealedCell[] {
	const dead = new Set(defeated);
	const first = new Map(teams.map(t => [cellKey(t.l, t.x, t.y), t.monsters[0]]));
	for (const c of reveal) {
		if (c.icon !== 'monster') continue;
		const k = cellKey(c.l, c.x, c.y);
		if (dead.has(k)) {
			c.icon = undefined;
		} else {
			const m = first.get(k);
			if (m) c.monster = monsterList[m].display ?? monsterList[m].name;
		}
	}
	return reveal;
}

/** Swap opened doors to their open skin and hide keys this player already holds. */
function decorateDoors(reveal: RevealedCell[], opened: string[], keys: number[]): RevealedCell[] {
	const open = new Set(opened);
	const owned = new Set(keys);
	for (const c of reveal) {
		if (c.icon === 'door_v' || c.icon === 'door_h') {
			if (open.has(cellKey(c.l, c.x, c.y))) c.icon += '_open';
		} else if (c.icon?.startsWith('key_') && owned.has(Number(c.icon.slice(4)))) {
			c.icon = undefined;
		}
	}
	return reveal;
}

/** The locked door sitting on (l,x,y), if any. */
function lockedDoorAt(d: DungeonStruct, l: number, x: number, y: number): DungeonDoor | null {
	for (const room of d.levels[l].rooms)
		for (const door of room.doors) if (door.x === x && door.y === y && door.key != null) return door;
	return null;
}

/** The key index lying on (l,x,y), if any. */
function keyIndexAt(d: DungeonStruct, l: number, x: number, y: number): number | null {
	for (const room of d.levels[l].rooms) {
		const it = room.item;
		if (it && it.k === DungeonItem.IKey && it.x === x && it.y === y) return it.v;
	}
	return null;
}

/** Flag the team on cell (l,x,y) beaten for this run; its icon stops appearing in reveals. */
export async function markMonsterDefeated(
	run: { id: string; defeated: string },
	l: number,
	x: number,
	y: number
): Promise<void> {
	const defeated = JSON.parse(run.defeated) as string[];
	const k = cellKey(l, x, y);
	if (defeated.includes(k)) return;
	defeated.push(k);
	await updateRunDefeated(run.id, JSON.stringify(defeated));
}

export async function startRun(req: Request): Promise<StartRunResult> {
	const authed = await auth(req);
	const dungeonName = req.params.id;
	const dungeon = await getDungeonByName(dungeonName);
	const dungeonRef = Object.values(DungeonList).find(d => d.name === dungeonName);
	if (!dungeon || !dungeonRef) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}
	const dinozId = req.body.dinozId;
	const dinoz = await getFollowingDinoz(dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}
	if (dungeonRef.placeStart !== dinoz.placeId) {
		throw new ExpectedError(translate('dungeon.wrongPlace', authed));
	}

	const team = [dinoz.id, ...dinoz.followers.map(d => d.id)];

	await updateMultipleDinoz(team, { unavailableReason: UnavailableReason.dungeon });

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	// Resume: one run per player per dungeon — hand back the position and
	// everything already revealed instead of violating the unique constraint.
	const existing = await findRun(dungeon.id, authed.id);
	if (existing) {
		return {
			runId: existing.id,
			pos: { l: existing.posL, x: existing.posX, y: existing.posY },
			width: d.width,
			height: d.height,
			levels: d.levels.length,
			skin: dungeon.type,
			skinSalt: Math.floor(Math.random() * 1000),
			reveal: decorateDoors(
				decorateMonsters(
					cellsForKeys(d, JSON.parse(existing.revealed) as string[]),
					JSON.parse(dungeon.monsters) as MonsterTeam[],
					JSON.parse(existing.defeated) as string[]
				),
				JSON.parse(existing.opened) as string[],
				JSON.parse(existing.keys) as number[]
			)
		};
	}

	const revealed = new Set<string>();
	const reveal = newReveals(revealAround(d, d.start.l, d.start.x, d.start.y), revealed);

	const run = await createRun(
		{ posX: d.start.x, posY: d.start.y, posL: d.start.l },
		JSON.stringify([...revealed]),
		authed.id,
		dungeon.id
	);

	return {
		runId: run.id,
		pos: { l: d.start.l, x: d.start.x, y: d.start.y },
		width: d.width,
		height: d.height,
		levels: d.levels.length,
		skin: dungeon.type,
		skinSalt: Math.floor(Math.random() * 1000),
		reveal: decorateMonsters(reveal, JSON.parse(dungeon.monsters) as MonsterTeam[], [])
	};
}

/** Stair lookup: is there a stair door at (l,x,y), and where does it lead? */
function stairTarget(d: DungeonStruct, l: number, x: number, y: number): number | undefined {
	for (const room of d.levels[l].rooms) {
		for (const door of room.doors) {
			if (door.x !== x || door.y !== y || door.up == null) continue;
			const to = door.up ? l + 1 : l - 1;
			if (to >= 0 && to < d.levels.length) return to;
		}
	}
	return undefined;
}

/**
 * Validate one step (dx/dy ∈ {-1,0,1}, or dl !== 0 to take a stair under the
 * dinoz) against the decrypted layout; persist and return only the new reveals.
 */
export async function move(req: Request): Promise<MoveResult> {
	const authed = await auth(req);
	const dx = +req.body.dx;
	const dl = +req.body.dl;
	const dy = +req.body.dy;
	const dungeonId = req.params.id;
	const dinozId = +req.body.dinozId;
	const dungeon = await getDungeonByName(dungeonId);
	if (!dungeon) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}
	const run = await findRun(dungeon.id, authed.id);
	if (!run) throw new ExpectedError(`Unknown dungeon run.`);

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	const cur = { l: run.posL, x: run.posX, y: run.posY };
	let next: { l: number; x: number; y: number } | null = null;

	if (dl !== 0) {
		// Stair traversal: only from a stair cell, only to the level it links.
		const to = stairTarget(d, cur.l, cur.x, cur.y);
		if (to !== undefined && to === cur.l + dl) next = { l: to, x: cur.x, y: cur.y };
	} else if (Math.abs(dx) + Math.abs(dy) === 1) {
		const nx = cur.x + dx;
		const ny = cur.y + dy;
		const walkable = nx >= 0 && ny >= 0 && nx < d.width && ny < d.height && d.levels[cur.l].table[nx][ny];
		if (walkable) next = { l: cur.l, x: nx, y: ny };
	}

	if (!next) {
		// Rejected: wall, out of bounds, or no stair here. No new knowledge leaks.
		return { ok: false, pos: cur, reveal: [] };
	}

	const keys = JSON.parse(run.keys) as number[];
	const opened = JSON.parse(run.opened) as string[];

	const door = lockedDoorAt(d, next.l, next.x, next.y);
	if (door && !opened.includes(cellKey(next.l, next.x, next.y))) {
		// Locked door: without its one matching key the step is refused like a wall.
		if (!keys.includes(door.key as number)) return { ok: false, pos: cur, reveal: [] };
		opened.push(cellKey(next.l, next.x, next.y));
	}

	// Walking over an uncollected key picks it up.
	const keyIdx = keyIndexAt(d, next.l, next.x, next.y);
	if (keyIdx != null && !keys.includes(keyIdx)) keys.push(keyIdx);

	const revealed = new Set<string>(JSON.parse(run.revealed) as string[]);
	const reveal = newReveals(revealAround(d, next.l, next.x, next.y), revealed);
	const monsters = JSON.parse(dungeon.monsters) as MonsterTeam[];
	const foundMonsters = monsters.find(m => {
		if (m.l === next?.l && m.y === next?.y && m.x === next.x) {
			return true;
		}
	});
	const defeated = new Set(JSON.parse(run.defeated) as string[]);
	let result: FightResult | undefined = undefined;
	if (foundMonsters && !defeated.has(cellKey(foundMonsters.l, foundMonsters.x, foundMonsters.y))) {
		const player = await getDinozFightDataRequest(dinozId, authed.id);
		if (!player) {
			throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
		}
		const dinozData = player.dinoz.find(d => d.id === dinozId);
		if (!dinozData) {
			throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
		}
		if (dinozData.unavailableReason !== UnavailableReason.dungeon) {
			throw new ExpectedError(`Dinoz is not able to fight in the dungeon.`);
		}
		let team = player.dinoz;

		// Go through followers and make those that are unavailable leave the group.
		const unavailableFollowers = team.filter(d => d.life <= 0 || d.unavailableReason !== UnavailableReason.dungeon);

		if (unavailableFollowers.length > 0) {
			for (const d of unavailableFollowers) {
				await updateDinoz(d.id, { leader: { disconnect: true } });
			}
			team = team.filter(d => d.life > 0 && d.unavailableReason === null);
		}

		if (dinozData.concentration) {
			throw new ExpectedError(translate(`concentration`, authed));
		}

		if (team.some(d => !d.fight)) {
			throw new ExpectedError(translate(`missingIrma`, authed));
		}

		if (!isAlive(dinozData)) {
			throw new ExpectedError(translate(`dead`, authed));
		}

		const monsters = [] as MonsterFiche[];
		for (const monster of foundMonsters.monsters) {
			monsters.push(monsterList[monster]);
		}

		const fightResult = calculateFightVsMonsters(team, player, PlaceEnum.CIMETIERE, monsters);
		result = await rewardFightVsMonsters(team, monsters, fightResult, PlaceEnum.CIMETIERE, player);

		if (result.result) {
			await markMonsterDefeated(run, next.l, next.x, next.y);
			defeated.add(cellKey(next.l, next.x, next.y));
		}
	}
	// Re-send the entered cell even if already revealed, so a door opening, a key
	// pickup or a won fight shows up immediately instead of on the next resume.
	const entered = cellKey(next.l, next.x, next.y);
	if (!reveal.some(c => cellKey(c.l, c.x, c.y) === entered)) reveal.push(...cellsForKeys(d, [entered]));

	await updateRun(
		run.id,
		{ posX: next.x, posY: next.y, posL: next.l },
		JSON.stringify([...revealed]),
		JSON.stringify(keys),
		JSON.stringify(opened)
	);

	return {
		ok: true,
		pos: next,
		reveal: decorateDoors(decorateMonsters(reveal, monsters, [...defeated]), opened, keys),
		fight: result
	};
}
