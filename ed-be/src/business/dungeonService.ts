/**
 * Sole holder of the maze layout: encrypted (AES-256-GCM) at rest and never sent to the
 * client, which only receives the fog-of-war reveals its own validated moves produce.
 */

import type { Dinoz } from '@drpg/prisma';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { DungeonCodec } from './dungeon/DungeonCodec.js';
import { Request } from 'express';
import { cellKey, cellsForKeys, revealAround } from './dungeon/reveal.js';
import type {
	DungeonScenario,
	MoveResult,
	MoveStep,
	RevealedCell,
	StartRunResult
} from '@drpg/core/models/dungeon/DungeonClient';
import { DungeonItem } from './dungeon/types.js';
import type { DungeonDoor, DungeonStruct } from './dungeon/types.js';
import { unseal } from '../utils/dungeonCrypto.js';
import {
	createRun,
	dinozEnterRun,
	dinozExitRun,
	findRun,
	findRunByLeader,
	flushRun,
	getDungeonById,
	getDungeonByName,
	updateRun,
	updateRunDefeated,
	updateRunHealing
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
import { itemList } from '@drpg/core/models/item/ItemList';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { UnavailableReason } from '@drpg/prisma/enums';
import { isAlive } from '@drpg/core/utils/DinozUtils';
import { calculateFightVsMonsters, rewardFightVsMonsters } from './fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { FightOutcome, FightResult } from '@drpg/core/models/fight/FightResult';
import { FightBackground } from '@drpg/core/models/fight/FightBackgroundList';
import { getRandomArrayElement } from '../utils/tools.js';
import { Place } from '@drpg/core/models/place/Place';

/** Gold granted per dungeon level for each collected pile. */
const GOLD_PER_LEVEL = 150;

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

/** Strip beaten teams' 'monster' icon; tag the rest with their first monster's gfx name. */
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

/** Strip the 'heal' icon from cells this player already healed on — they're spent. */
function decorateHeal(reveal: RevealedCell[], healed: string[]): RevealedCell[] {
	const done = new Set(healed);
	for (const c of reveal) {
		if (c.icon === 'heal' && done.has(cellKey(c.l, c.x, c.y))) c.icon = undefined;
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
	// An item carries absolute coordinates somewhere inside its room's rectangle, so it is
	// the item's own position that must match: a room's (x,y) is the rect origin, which is
	// rarely the item's cell (only gridImport's 1x1 item rooms make the two coincide).
	const room = d.levels[l].rooms.find(r => r.item != null && r.item.k === k && r.item.x === x && r.item.y === y);
	return room?.item?.v ?? null;
}

/** Whether this dinoz (leader or follower) stands on its run's healing cell, unspent. */
export async function isOnHealingCell(dinoz: Pick<Dinoz, 'id' | 'leaderId'>): Promise<boolean> {
	const run = await findRunByLeader(dinoz.leaderId ?? dinoz.id);
	if (!run) {
		return false;
	}
	const here = cellKey(run.posL, run.posX, run.posY);
	// The cell stays open until the party walks off it.
	if (run.healPending === here) {
		return true;
	}
	if ((JSON.parse(run.healed) as string[]).includes(here)) {
		return false;
	}
	const dungeon = await getDungeonById(run.dungeonId);
	if (!dungeon) {
		return false;
	}
	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	return itemIndexAt(codec.d, DungeonItem.IHeal, run.posL, run.posX, run.posY) != null;
}

/**
 * Note that the party healed here. The cell keeps working until they step off it
 * (move() spends it). Caller has checked isOnHealingCell() first.
 */
export async function markHealingCellUsed(dinoz: Pick<Dinoz, 'id' | 'leaderId'>): Promise<void> {
	const run = await findRunByLeader(dinoz.leaderId ?? dinoz.id);
	if (!run) return;
	const here = cellKey(run.posL, run.posX, run.posY);
	if (run.healPending === here) return;
	await updateRunHealing(run.id, run.healed, here);
	await flushRun(run.id);
}

/** Resolve 'scenario_<v>' tokens: strip the ones already read, give the rest their icon. */
function decorateScenarios(reveal: RevealedCell[], scenarios: DungeonScenario[], read: number[]): RevealedCell[] {
	const done = new Set(read);
	for (const c of reveal) {
		if (!c.icon?.startsWith('scenario_')) continue;
		const v = Number(c.icon.slice(9));
		c.icon = done.has(v) ? undefined : (scenarios[v]?.icon ?? 'chest');
	}
	return reveal;
}

function scenariosFor(dungeon: { scenarios: string }): DungeonScenario[] {
	return JSON.parse(dungeon.scenarios) as DungeonScenario[];
}

/**
 * A dinoz that died or was pulled away mid-run leaves the party for good; dying also
 * clears unavailableReason. The leader's live followers ARE the team, so no roster to update.
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
	if (!dungeon) {
		dungeon = await getDungeonById(dungeonName);
		if (!dungeon) {
			throw new ExpectedError(translate('dungeon.notFound', authed));
		}
	}
	if (!dungeon.isActive) {
		throw new ExpectedError(translate('dungeon.notFound', authed));
	}
	const dinozId = req.body.dinozId;
	const dinoz = await getFollowingDinoz(dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed));
	}
	if (dinoz.leaderId !== null) {
		throw new ExpectedError(translate('notLeader', authed));
	}

	if (dungeon.placeStart != null && dungeon.placeStart !== dinoz.placeId) {
		throw new ExpectedError(translate('dungeon.wrongPlace', authed));
	}

	// One run per player per dungeon. Looked up before the busy check so a dungeon-busy
	// dinoz only gets through when it's resuming its own run.
	const team = [dinoz, ...dinoz.followers];
	if (team.some(t => t.unavailableReason && t.unavailableReason !== UnavailableReason.dungeon)) {
		throw new ExpectedError(translate('error.dinozNotAvailable', authed));
	}

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	// Resume: hand back the position and everything already revealed.
	const existing = await findRun(dungeon.id, authed.id);
	if (existing) {
		// Only one team at a time in the dungeon.
		if (existing.leaderId && existing.leaderId !== dinoz.id) {
			throw new ExpectedError(translate('dungeon.wrongTeam', authed));
		}
		await updateMultipleDinoz(
			team.map(t => t.id),
			{ unavailableReason: UnavailableReason.dungeon }
		);
		await dinozEnterRun(existing.id, dinoz.id);
		return {
			run: {
				id: existing.id,
				status: 'resumed',
				message:
					dungeon.placeStart != null &&
					d.start.l === existing.posL &&
					d.start.x === existing.posX &&
					d.start.y === existing.posY
						? `dungeon.${dungeon.name}.enter`
						: undefined
			},
			pos: { l: existing.posL, x: existing.posX, y: existing.posY },
			width: d.width,
			height: d.height,
			levels: d.levels.length,
			skin: dungeon.type,
			skinSalt: Math.floor(Math.random() * 1000),
			reveal: decorateScenarios(
				decorateHeal(
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
					JSON.parse(existing.healed) as string[]
				),
				scenariosFor(dungeon),
				JSON.parse(existing.scenarios) as number[]
			)
		};
	}

	await updateMultipleDinoz(
		team.map(t => t.id),
		{ unavailableReason: UnavailableReason.dungeon }
	);

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
			scenariosFor(dungeon),
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
			throw new ExpectedError(translate('dungeon.notFound', authed));
		}
	}
	const dinozId = req.body.dinozId;
	const dinoz = await getFollowingDinoz(dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed));
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

	// Dead/pulled-away followers already left in move(), so the live followers are the whole team.
	const team = [dinoz.id, ...dinoz.followers.map(f => f.id)];
	await updateMultipleDinoz(team, { unavailableReason: null });
	await dinozExitRun(run.id);
}

/** The level a stair door at (l,x,y) leads to, if there is one. */
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
 * Validate a batch of steps (dx/dy ∈ {-1,0,1}, or dl !== 0 for a stair under the dinoz)
 * against the decrypted layout; decode and persist once for the whole batch, and return
 * only the new reveals. The loop stops at the first refused step or event cell (fight,
 * scenario, gold) so the result stays single-valued; the client re-sends the rest.
 */
export async function move(req: Request): Promise<MoveResult> {
	const authed = await auth(req);
	const steps = req.body.steps as MoveStep[];
	const dungeonId = req.params.id;
	const dinozId = +req.body.dinozId;
	let dungeon = await getDungeonByName(dungeonId);
	if (!dungeon) {
		dungeon = await getDungeonById(dungeonId);
		if (!dungeon) {
			throw new ExpectedError(translate('dungeon.notFound', authed));
		}
	}
	const run = await findRun(dungeon.id, authed.id);
	if (!run) throw new ExpectedError(`Unknown dungeon run.`);

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	// Parsed once, mutated in place by the loop, serialized once by the updateRun at the end.
	const keys = JSON.parse(run.keys) as number[];
	const opened = JSON.parse(run.opened) as string[];
	const read = JSON.parse(run.scenarios) as number[];
	const goldCollected = new Set<string>(JSON.parse(run.gold) as string[]);
	const healed = JSON.parse(run.healed) as string[];
	const revealed = new Set<string>(JSON.parse(run.revealed) as string[]);
	const defeated = new Set(JSON.parse(run.defeated) as string[]);
	const scenarios = scenariosFor(dungeon);
	const monsters = JSON.parse(dungeon.monsters) as MonsterTeam[];

	let cur = { l: run.posL, x: run.posX, y: run.posY };
	// `saved` diverges from `cur` only on a lost fight: the run rewinds to the door while
	// the response still reports the cell that was entered.
	let saved = cur;
	const reveal: RevealedCell[] = [];
	let applied = 0;
	let ok = true;
	let scenario: MoveResult['scenario'];
	let goldReward: number | undefined;
	let result: FightResult | undefined = undefined;

	/**
	 * Persist everything mutated so far, durably, before an irreversible payout. The run row
	 * is write-back cached, but `gold`/`scenarios`/`defeated` are what stop a double reward:
	 * mark and flush first, then pay. A crash in the gap costs one reward instead of minting one.
	 */
	const checkpoint = async (pos: { l: number; x: number; y: number }): Promise<void> => {
		await updateRun(
			run.id,
			{ posX: pos.x, posY: pos.y, posL: pos.l },
			JSON.stringify([...revealed]),
			JSON.stringify(keys),
			JSON.stringify(opened),
			JSON.stringify(read),
			JSON.stringify([...goldCollected])
		);
		await flushRun(run.id);
	};

	for (const step of steps) {
		const dx = +step.dx;
		const dy = +step.dy;
		const dl = +step.dl;
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
			// Wall, out of bounds, or no stair here. No new knowledge leaks.
			ok = false;
			break;
		}

		const door = lockedDoorAt(d, next.l, next.x, next.y);
		if (door && !opened.includes(cellKey(next.l, next.x, next.y))) {
			// Locked door: without its one matching key the step is refused like a wall.
			if (!keys.includes(door.key as number)) {
				ok = false;
				break;
			}
			opened.push(cellKey(next.l, next.x, next.y));
		}

		// Walking over an uncollected key picks it up.
		const keyIdx = itemIndexAt(d, DungeonItem.IKey, next.l, next.x, next.y);
		if (keyIdx != null && !keys.includes(keyIdx)) keys.push(keyIdx);

		// First visit of a scenario spot: grant its obj/collec and hand the text over.
		const sIdx = itemIndexAt(d, DungeonItem.IScenario, next.l, next.x, next.y);
		const sc = sIdx != null && !read.includes(sIdx) ? scenarios[sIdx] : undefined;
		if (sc && sIdx != null) {
			read.push(sIdx);
			// Mark the scenario read before granting what it carries.
			if (sc.obj != null || sc.collec != null) await checkpoint(next);
			if (sc.obj != null) await increaseItemQuantity(authed.id, itemList[sc.obj].itemId, sc.count ?? 1);
			if (sc.collec != null) await addRewardToPlayer({ rewardId: sc.collec, player: { connect: { id: authed.id } } });
			// Builder scenarios carry raw text; the client's $t falls through to it unchanged.
			scenario = { text: sc.raw ? sc.text : `dungeon.${dungeon.name}.${sc.text}`, micon: sc.micon };
		}

		// First visit of a gold pile: reward gold scaled to the dungeon's level, then it's gone for good.
		const goldHere = itemIndexAt(d, DungeonItem.IGold, next.l, next.x, next.y) != null;
		if (goldHere && !goldCollected.has(cellKey(next.l, next.x, next.y))) {
			goldCollected.add(cellKey(next.l, next.x, next.y));
			goldReward = Math.round(dungeon.level * GOLD_PER_LEVEL * (0.93 + Math.random() * 0.17));
			// Mark the pile collected before paying for it.
			await checkpoint(next);
			await addMoney(authed.id, goldReward);
		}

		reveal.push(...newReveals(revealAround(d, next.l, next.x, next.y), revealed));
		const foundMonsters = monsters.find(m => {
			if (m.l === next?.l && m.y === next?.y && m.x === next.x) {
				return true;
			}
		});
		// A lost fight rewinds the saved position to the dungeon door instead of the entered cell.
		let lost = false;
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

			// Already-dead or pulled-away dinoz leave the party before being dragged into a fight.
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

			const monsterFiches = [] as MonsterFiche[];
			for (const monster of foundMonsters.monsters) {
				monsterFiches.push(monsterList[monster]);
			}

			// calculateFightVsMonsters is pure and already settles the outcome, so record the win
			// durably before the rewards land — a crash between would let the monster be farmed.
			const fightResult = calculateFightVsMonsters(team, player, dungeon.placeStart as PlaceEnum, monsterFiches);
			if (fightResult.outcome === FightOutcome.AttackerWin) {
				await markMonsterDefeated(run, next.l, next.x, next.y);
				defeated.add(cellKey(next.l, next.x, next.y));
				await flushRun(run.id);
			}
			result = await rewardFightVsMonsters(team, monsterFiches, fightResult, dungeon.placeStart as PlaceEnum, player);

			// The dungeon's own scenery: one key drawn per fight out of its pool, overriding the
			// background placeStart would otherwise resolve to. An empty pool keeps that default.
			const backgrounds = JSON.parse(dungeon.fightBackgrounds) as FightBackground[];
			if (backgrounds.length > 0) result.background = getRandomArrayElement(backgrounds);

			// Same test rewardFightVsMonsters uses to log a Death: hpLost against the life it
			// fetched the team with, before its own decrement lands.
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

			if (!result.result) {
				// Wiped: the run's leader leaves, and the next entrant restarts from the door.
				lost = true;
				await dinozExitRun(run.id);
			}
			await updateMultipleDinoz(
				team.map(d => d.id),
				{ fight: false }
			);
		}

		// Re-send the entered cell even if already revealed, so a door opening, key pickup or
		// won fight shows up now instead of on the next resume.
		const entered = cellKey(next.l, next.x, next.y);
		if (!reveal.some(c => cellKey(c.l, c.x, c.y) === entered)) reveal.push(...cellsForKeys(d, [entered]));

		cur = next;
		saved = lost ? d.start : next;
		applied++;
		// The result carries at most one fight, scenario and gold pile.
		if (result || scenario || goldReward != null) break;
	}

	// A batch refused on its first step changed nothing: keep it a pure read.
	if (applied > 0) {
		// Walking off a cell the party healed on spends it: it never heals again.
		if (run.healPending && run.healPending !== cellKey(saved.l, saved.x, saved.y)) {
			healed.push(run.healPending);
			await updateRunHealing(run.id, JSON.stringify(healed), null);
		}
		await updateRun(
			run.id,
			{ posX: saved.x, posY: saved.y, posL: saved.l },
			JSON.stringify([...revealed]),
			JSON.stringify(keys),
			JSON.stringify(opened),
			JSON.stringify(read),
			JSON.stringify([...goldCollected])
		);
	}

	return {
		ok,
		pos: cur,
		applied,
		reveal: decorateScenarios(
			decorateHeal(
				decorateGold(decorateDoors(decorateMonsters(reveal, monsters, [...defeated]), opened, keys), [
					...goldCollected
				]),
				healed
			),
			scenarios,
			read
		),
		fight: result,
		scenario,
		gold: goldReward
	};
}
