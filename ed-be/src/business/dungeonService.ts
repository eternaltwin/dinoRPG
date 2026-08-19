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
import {
	createRun,
	dinozEnterRun,
	dinozExitRun,
	findRun,
	getDungeonById,
	getDungeonByName,
	updateRun,
	updateRunDefeated
} from '../dao/dungeonRunDao.js';
import translate from '../utils/server/translate.js';
import { addMoney, auth } from '../dao/playerDao.js';
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
import type { DungeonScenario } from '@drpg/core/models/dungeon/DungeonList';
import { itemList } from '@drpg/core/models/item/ItemList';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { UnavailableReason } from '@drpg/prisma/enums';
import { isAlive } from '@drpg/core/utils/DinozUtils';
import { calculateFightVsMonsters, rewardFightVsMonsters } from './fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { FightResult } from '@drpg/core/models/fight/FightResult';

/** Gold granted per dungeon level for each collected pile. */
const GOLD_PER_LEVEL = 100;

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

/** Strip the 'gold' icon from cells whose pile this player already collected. */
function decorateGold(reveal: RevealedCell[], collected: string[]): RevealedCell[] {
	const done = new Set(collected);
	for (const c of reveal) {
		if (c.icon === 'gold' && done.has(cellKey(c.l, c.x, c.y))) c.icon = undefined;
	}
	return reveal;
}

/** The locked door sitting on (l,x,y), if any. */
function lockedDoorAt(d: DungeonStruct, l: number, x: number, y: number): DungeonDoor | null {
	for (const room of d.levels[l].rooms)
		for (const door of room.doors) if (door.x === x && door.y === y && door.key != null) return door;
	return null;
}

/** The index (`v`) of the item of kind `k` lying on (l,x,y), if any. */
function itemIndexAt(d: DungeonStruct, k: DungeonItem, l: number, x: number, y: number): number | null {
	for (const room of d.levels[l].rooms) {
		const it = room.item;
		if (it && it.k === k && it.x === x && it.y === y) return it.v;
	}
	return null;
}

/**
 * Resolve 'scenario_<v>' tokens against the dungeon's scenario list: strip the
 * ones this player already read, give the others their XML icon (chest default).
 */
function decorateScenarios(reveal: RevealedCell[], scenarios: DungeonScenario[], read: number[]): RevealedCell[] {
	const done = new Set(read);
	for (const c of reveal) {
		if (!c.icon?.startsWith('scenario_')) continue;
		const v = Number(c.icon.slice(9));
		c.icon = done.has(v) ? undefined : (scenarios[v]?.icon ?? 'chest');
	}
	return reveal;
}

/**
 * A dungeon's scenario list: its own stored one (builder dungeons, raw popup
 * text) or, when empty, the DungeonList entry of the same name (i18n text).
 */
function scenariosFor(dungeon: { name: string; scenarios: string }): { list: DungeonScenario[]; i18n: boolean } {
	const own = JSON.parse(dungeon.scenarios) as DungeonScenario[];
	if (own.length > 0) return { list: own, i18n: false };
	return { list: Object.values(DungeonList).find(x => x.name === dungeon.name)?.scenarios ?? [], i18n: true };
}

/**
 * A dinoz that died (or was pulled away, e.g. by an admin action) mid-run leaves
 * the party for good. Dead dinoz also get their unavailableReason cleared —
 * dying is how they leave the dungeon. No roster to update: the leader's live
 * followers (Dinoz.leaderId) ARE the rest of the team.
 */
async function dropFromTeam(dinozIds: number[], clearUnavailable: boolean): Promise<void> {
	for (const id of dinozIds) {
		await updateDinoz(
			id,
			clearUnavailable ? { leader: { disconnect: true }, unavailableReason: null } : { leader: { disconnect: true } }
		);
	}
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
	let dungeon = await getDungeonByName(dungeonName);
	const dungeonRef = Object.values(DungeonList).find(d => d.name === dungeonName);
	if (!dungeon) {
		dungeon = await getDungeonById(dungeonName);
		if (!dungeon) {
			throw new ExpectedError(translate('dungeon.inexistent', authed));
		}
	}
	const dinozId = req.body.dinozId;
	const dinoz = await getFollowingDinoz(dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}
	// ponytail: builder dungeons have no DungeonList entry, so no place gate —
	// they're enterable from anywhere until they get a placeStart of their own.
	if (dungeonRef && dungeonRef.placeStart !== dinoz.placeId) {
		throw new ExpectedError(translate('dungeon.wrongPlace', authed));
	}

	const team = [dinoz, ...dinoz.followers];
	// Resume: one run per player per dungeon — look this up before the busy
	// check so a dungeon-busy dinoz is only let through when it's actually
	// resuming its own run, not stolen into a new one.
	const existing = await findRun(dungeon.id, authed.id);
	const resumable = existing != null && (existing.leaderId == null || existing.leaderId === dinoz.id);
	if (team.some(t => t.unavailableReason && !(resumable && t.unavailableReason === UnavailableReason.dungeon))) {
		// A team member is already busy elsewhere, refuse entry.
		throw new ExpectedError(translate('dungeon.teamBusy', authed));
	}

	await updateMultipleDinoz(
		team.map(t => t.id),
		{ unavailableReason: UnavailableReason.dungeon }
	);

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	// hand back the position and everything already revealed instead of
	// violating the unique constraint.
	if (existing) {
		// Only one team at a time in the dungeon
		if (existing.leaderId && existing.leaderId !== dinoz.id) {
			throw new ExpectedError(translate('dungeon.wrongTeam', authed));
		}
		await dinozEnterRun(existing.id, dinoz.id);
		return {
			run: { id: existing.id, status: 'resumed', message: dungeonRef ? `dungeon.${dungeonRef.name}.enter` : undefined },
			pos: { l: existing.posL, x: existing.posX, y: existing.posY },
			width: d.width,
			height: d.height,
			levels: d.levels.length,
			skin: dungeon.type,
			skinSalt: Math.floor(Math.random() * 1000),
			reveal: decorateScenarios(
				decorateGold(
					decorateDoors(
						decorateMonsters(
							cellsForKeys(d, JSON.parse(existing.revealed) as string[]),
							JSON.parse(dungeon.monsters) as MonsterTeam[],
							JSON.parse(existing.defeated) as string[]
						),
						JSON.parse(existing.opened) as string[],
						JSON.parse(existing.keys) as number[]
					),
					JSON.parse(existing.gold) as string[]
				),
				scenariosFor(dungeon).list,
				JSON.parse(existing.scenarios) as number[]
			)
		};
	}

	const revealed = new Set<string>();
	const reveal = newReveals(revealAround(d, d.start.l, d.start.x, d.start.y), revealed);

	const run = await createRun(
		{ posX: d.start.x, posY: d.start.y, posL: d.start.l },
		JSON.stringify([...revealed]),
		authed.id,
		dungeon.id,
		dinoz.id
	);

	return {
		run: { id: run.id, status: 'created' },
		pos: { l: d.start.l, x: d.start.x, y: d.start.y },
		width: d.width,
		height: d.height,
		levels: d.levels.length,
		skin: dungeon.type,
		skinSalt: Math.floor(Math.random() * 1000),
		reveal: decorateScenarios(
			decorateMonsters(reveal, JSON.parse(dungeon.monsters) as MonsterTeam[], []),
			scenariosFor(dungeon).list,
			[]
		)
	};
}

export async function exitRun(req: Request) {
	const authed = await auth(req);
	const dungeonName = req.params.id;
	let dungeon = await getDungeonByName(dungeonName);
	if (!dungeon) {
		dungeon = await getDungeonById(dungeonName);
		if (!dungeon) {
			throw new ExpectedError(translate('dungeon.inexistent', authed));
		}
	}
	const dinozId = req.body.dinozId;
	const dinoz = await getFollowingDinoz(dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}

	const run = await findRun(dungeon.id, authed.id);
	if (!run) {
		throw new ExpectedError(translate('dungeon.noRun', authed));
	}
	if (run.leaderId !== dinoz.id) {
		throw new ExpectedError(translate('dungeon.wrongTeam', authed));
	}

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	const atStart = run.posL === d.start.l && run.posX === d.start.x && run.posY === d.start.y;
	const atExit = run.posL === d.exit.l && run.posX === d.exit.x && run.posY === d.exit.y;
	if (!atStart && !atExit) {
		throw new ExpectedError(translate('dungeon.notAtExit', authed));
	}

	// A dead/pulled-away follower already left (dropFromTeam, in move()) and no
	// longer shows up here — the leader's live followers are the whole team.
	const team = [dinoz.id, ...dinoz.followers.map(f => f.id)];
	await updateMultipleDinoz(team, { unavailableReason: null });
	await dinozExitRun(run.id, dinoz.id);
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
	let dungeon = await getDungeonByName(dungeonId);
	if (!dungeon) {
		dungeon = await getDungeonById(dungeonId);
		if (!dungeon) {
			throw new ExpectedError(translate('dungeon.inexistent', authed));
		}
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
	const keyIdx = itemIndexAt(d, DungeonItem.IKey, next.l, next.x, next.y);
	if (keyIdx != null && !keys.includes(keyIdx)) keys.push(keyIdx);

	// First visit of a scenario spot: grant its obj/collec and hand the text over.
	const scenarios = scenariosFor(dungeon);
	const read = JSON.parse(run.scenarios) as number[];
	let scenario: MoveResult['scenario'];
	const sIdx = itemIndexAt(d, DungeonItem.IScenario, next.l, next.x, next.y);
	const sc = sIdx != null && !read.includes(sIdx) ? scenarios.list[sIdx] : undefined;
	if (sc && sIdx != null) {
		read.push(sIdx);
		if (sc.obj != null) await increaseItemQuantity(authed.id, itemList[sc.obj].itemId, sc.count ?? 1);
		if (sc.collec != null) await addRewardToPlayer({ rewardId: sc.collec, player: { connect: { id: authed.id } } });
		// Builder scenarios carry raw text; the client's $t falls through to it unchanged.
		scenario = { text: scenarios.i18n ? `dungeon.${dungeon.name}.${sc.text}` : sc.text, micon: sc.micon };
	}

	// First visit of a gold pile: reward gold scaled to the dungeon's level, then it's gone for good.
	const goldCollected = new Set<string>(JSON.parse(run.gold) as string[]);
	let goldReward: number | undefined;
	const goldHere = itemIndexAt(d, DungeonItem.IGold, next.l, next.x, next.y) != null;
	if (goldHere && !goldCollected.has(cellKey(next.l, next.x, next.y))) {
		goldCollected.add(cellKey(next.l, next.x, next.y));
		goldReward = dungeon.level * GOLD_PER_LEVEL;
		await addMoney(authed.id, goldReward);
	}

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

		// A dinoz already dead (from an earlier fight this run) or pulled away by
		// something else leaves the party — and, if dead, the dungeon itself —
		// before it can be dragged into another fight.
		const dead = team.filter(d => d.life <= 0);
		const pulledAway = team.filter(d => d.life > 0 && d.unavailableReason !== UnavailableReason.dungeon);
		if (dead.length > 0)
			await dropFromTeam(
				dead.map(d => d.id),
				true
			);
		if (pulledAway.length > 0)
			await dropFromTeam(
				pulledAway.map(d => d.id),
				false
			);
		team = team.filter(d => d.life > 0 && d.unavailableReason === UnavailableReason.dungeon);

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

		// Same test rewardFightVsMonsters uses to log a Death: hpLost against the
		// life it fetched the team with, before its own decrement lands.
		const diedInFight = team.filter(d => {
			const attacker = fightResult.attackers.find(a => a.dinozId === d.id);
			return attacker != null && attacker.hpLost >= d.life;
		});
		if (diedInFight.length > 0) {
			await dropFromTeam(
				diedInFight.map(d => d.id),
				true
			);
			team = team.filter(d => !diedInFight.some(dead => dead.id === d.id));
		}

		if (result.result) {
			await markMonsterDefeated(run, next.l, next.x, next.y);
			defeated.add(cellKey(next.l, next.x, next.y));
		}
		await updateMultipleDinoz(
			team.map(d => d.id),
			{ fight: false }
		);
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
		JSON.stringify(opened),
		JSON.stringify(read),
		JSON.stringify([...goldCollected])
	);

	return {
		ok: true,
		pos: next,
		reveal: decorateScenarios(
			decorateGold(decorateDoors(decorateMonsters(reveal, monsters, [...defeated]), opened, keys), [...goldCollected]),
			scenarios.list,
			read
		),
		fight: result,
		scenario,
		gold: goldReward
	};
}
