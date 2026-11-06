import {
	BOARD_MATCH_QUOTA,
	BOARD_MAX_STORED_AP,
	BOARD_TICK_AP,
	BOARD_TICK_MINUTES,
	BoardDirection,
	BoardMoveResult,
	BoardPieceDTO,
	FightJournalEntryDTO,
	JOURNAL_PAGE_SIZE,
	MatchBoardDTO,
	PLACE_REVEAL_HOURS
} from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { CLAN_CHAMPIONSHIP_PVP_RULES } from '@drpg/core/models/fight/FightConfiguration';
import { FightOutcome, FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { calculateXPBonus, getMaxXp } from '@drpg/core/utils/DinozUtils';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import {
	ClanChampionshipMatchStatus,
	ClanChampionshipPieceState,
	LogType,
	Prisma,
	UnavailableReason
} from '@drpg/prisma';
import { CronJob } from 'cron';
import seedrandom from 'seedrandom';
import { LocalTransactionClient } from '../dao/clansDao.js';
import { archiveFight } from '../dao/archiveDao.js';
import { getDinozForChampionshipFight } from '../dao/dinozDao.js';
import { Auth } from '../dao/playerDao.js';
import { prisma } from '../prisma.js';
import {
	cellIndex,
	entryColumn,
	fightZone,
	generateObstacles,
	isBehindAttack,
	isInBounds,
	pickEntryCell,
	scoreLine,
	Side,
	step
} from '../utils/clanChampionship/board.js';
import { computePvpXp } from '../utils/fight/pvpXp.js';
import { gameConfig } from '../utils/gameConfig.js';
import translate from '../utils/server/translate.js';
import { getRandomArrayElement } from '../utils/tools.js';
import { findActiveChampionshipEvent, findVisibleChampionshipEvent, parseEventConfig } from './clanEventService.js';
import { calculateFightBetweenPlayers } from './fightService.js';
import { finishChampionship, runChampionshipJob } from './clanChampionshipService.js';
import { publishBoardChanged, publishChampionshipChanged } from './clanChampionshipEvents.js';

const HOUR_MS = 60 * 60 * 1000;
const TICK_MS = BOARD_TICK_MINUTES * 60 * 1000;
const MAX_TICKS = 288;
/** The cron may fire a few ms early: ticks, kick-off and end are computed this far ahead of the wall clock. */
const TICK_TOLERANCE_MS = 5000;

type MatchRow = {
	id: string;
	homeClanId: number | null;
	awayClanId: number | null;
	placeId: number | null;
};

/** Row lock on a match: serialises the tick with player actions on the same board. */
export async function lockMatch(tx: LocalTransactionClient, matchId: string): Promise<void> {
	await tx.$queryRaw`SELECT id FROM "clan_championship_match" WHERE id = ${matchId}::uuid FOR UPDATE`;
}

/** Bumps the board version inside the caller's transaction; returns the new version. */
async function bumpVersion(tx: LocalTransactionClient, matchId: string): Promise<number> {
	const updated = await tx.clanChampionshipMatch.update({
		where: { id: matchId },
		data: { version: { increment: 1 } },
		select: { version: true }
	});
	return updated.version;
}

/** Reveals the place of a match by drawing it among the championship places. */
export async function drawMatchPlace(tx: LocalTransactionClient, match: { id: string }, places: PlaceEnum[]) {
	await tx.clanChampionshipMatch.update({
		where: { id: match.id },
		data: { placeId: getRandomArrayElement(places) }
	});
}

/** Returns whether the run changed the match. */
async function processMatch(match: MatchClans, places: PlaceEnum[], wallNow: Date): Promise<boolean> {
	const version = await processMatchInTransaction(match.id, places, wallNow);
	if (version === null) return false;
	publishBoardChanged(match, version);
	return true;
}

/** Returns the new board version when the run changed the match (bumped once), null otherwise. */
async function processMatchInTransaction(matchId: string, places: PlaceEnum[], wallNow: Date): Promise<number | null> {
	const now = new Date(wallNow.getTime() + TICK_TOLERANCE_MS);
	return prisma.$transaction(
		async tx => {
			await lockMatch(tx, matchId);
			const match = await tx.clanChampionshipMatch.findUnique({ where: { id: matchId } });
			if (!match || match.status === ClanChampionshipMatchStatus.finished) return null;

			const data: Record<string, unknown> = {};
			let placeDrawn = false;
			let status = match.status;
			let westClanId = match.westClanId;
			let ticksApplied = match.ticksApplied;
			let homeScore = match.homeScore;
			let awayScore = match.awayScore;

			if (match.placeId === null && now.getTime() >= match.startsAt.getTime() - PLACE_REVEAL_HOURS * HOUR_MS) {
				await drawMatchPlace(tx, match as MatchRow, places);
				placeDrawn = true;
			}

			if (status === ClanChampionshipMatchStatus.scheduled && now >= match.startsAt) {
				const rng = seedrandom(match.id);
				data.obstacles = generateObstacles(rng);
				westClanId = getRandomArrayElement([match.homeClanId, match.awayClanId], rng);
				data.westClanId = westClanId;
				status = ClanChampionshipMatchStatus.live;
				data.status = status;
			}

			if (status === ClanChampionshipMatchStatus.live) {
				const elapsed = Math.min(now.getTime(), match.endsAt.getTime()) - match.startsAt.getTime();
				const expected = Math.min(MAX_TICKS, Math.floor(elapsed / TICK_MS));
				const missed = expected - ticksApplied;
				if (missed > 0) {
					const pieces = await tx.clanChampionshipPiece.findMany({
						where: { matchId, state: ClanChampionshipPieceState.onBoard }
					});
					// The board does not change between catch-up ticks, so every missed tick scores the same.
					const sides = { homeClanId: match.homeClanId, awayClanId: match.awayClanId, westClanId };
					const westIsHome = westIsHomeOf(sides);
					const isWest = (p: { clanId: number }) => isWestClan(sides, p.clanId);
					const board = pieces.map(p => ({ id: p.id, clanId: p.clanId, x: p.x as number, y: p.y as number }));
					const west = board.filter(isWest);
					const east = board.filter(p => !isWest(p));
					const westGain = scoreLine('west', west, east) * missed;
					const eastGain = scoreLine('east', east, west) * missed;
					homeScore += westIsHome ? westGain : eastGain;
					awayScore += westIsHome ? eastGain : westGain;
					if (pieces.length > 0) {
						await tx.clanChampionshipPiece.updateMany({
							where: { matchId, state: ClanChampionshipPieceState.onBoard },
							data: { actionPoints: { increment: BOARD_TICK_AP * missed } }
						});
						await tx.clanChampionshipPiece.updateMany({
							where: {
								matchId,
								state: ClanChampionshipPieceState.onBoard,
								actionPoints: { gt: BOARD_MAX_STORED_AP }
							},
							data: { actionPoints: BOARD_MAX_STORED_AP }
						});
					}
					ticksApplied = expected;
					Object.assign(data, { homeScore, awayScore, ticksApplied });
				}

				if (now >= match.endsAt) {
					const onBoard = await tx.clanChampionshipPiece.findMany({
						where: { matchId, state: ClanChampionshipPieceState.onBoard },
						select: { dinozId: true }
					});
					await tx.clanChampionshipPiece.updateMany({
						where: { matchId, state: ClanChampionshipPieceState.onBoard },
						data: { state: ClanChampionshipPieceState.left, x: null, y: null }
					});
					if (onBoard.length > 0) {
						await tx.dinoz.updateMany({
							where: {
								id: { in: onBoard.map(p => p.dinozId) },
								unavailableReason: UnavailableReason.clanChampionship
							},
							data: { unavailableReason: null }
						});
					}
					data.winnerClanId =
						homeScore === awayScore ? null : homeScore > awayScore ? match.homeClanId : match.awayClanId;
					data.status = ClanChampionshipMatchStatus.finished;
				}
			}

			if (Object.keys(data).length === 0 && !placeDrawn) return null;
			const updated = await tx.clanChampionshipMatch.update({
				where: { id: matchId },
				data: { ...data, version: { increment: 1 } },
				select: { version: true }
			});
			return updated.version;
		},
		{ timeout: 15000 }
	);
}

/**
 * Every 10 minutes: reveals places, kicks matches off, scores the missed board ticks, ends matches
 * and finally the championship. Each match runs in its own transaction; a failing match is reported
 * and does not stop the others.
 */
export async function championshipTick(now: Date = new Date()): Promise<void> {
	const event = await findActiveChampionshipEvent();
	if (!event) return;
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	if (config.phase !== 'running') return;

	const open = await prisma.clanChampionshipMatch.findMany({
		where: { eventId: event.id, status: { not: ClanChampionshipMatchStatus.finished } },
		select: { id: true, homeClanId: true, awayClanId: true }
	});
	let changed = false as boolean;
	for (const match of open) {
		await runChampionshipJob(`championshipMatch_${match.id}`, async () => {
			if (await processMatch(match, config.places, now)) changed = true;
		})();
	}
	if (changed) publishChampionshipChanged();

	const remaining = await prisma.clanChampionshipMatch.count({
		where: { eventId: event.id, status: { not: ClanChampionshipMatchStatus.finished } }
	});
	if (remaining === 0) await finishChampionship(event.id);
}

export function startChampionshipTicker(): CronJob {
	return new CronJob(
		'*/10 * * * *',
		() => {
			void runChampionshipJob('championshipTick', () => championshipTick())();
		},
		null,
		false,
		'UTC'
	);
}

type Authed = Auth;
type MatchClans = { id: string; homeClanId: number | null; awayClanId: number | null };
type MatchEntity = NonNullable<Awaited<ReturnType<typeof prisma.clanChampionshipMatch.findUnique>>>;
type PieceEntity = NonNullable<Awaited<ReturnType<typeof prisma.clanChampionshipPiece.findUnique>>>;

/** The live match of the active championship in which the clan plays, if any. */
export async function findLiveMatchOfClan(clanId: number, tx: LocalTransactionClient = prisma) {
	const event = await findActiveChampionshipEvent(tx);
	if (!event) return null;
	return tx.clanChampionshipMatch.findFirst({
		where: {
			eventId: event.id,
			status: ClanChampionshipMatchStatus.live,
			OR: [{ homeClanId: clanId }, { awayClanId: clanId }]
		}
	});
}

/** The match a clan may follow: its live match, else its latest finished one of the (still visible) championship. */
export async function findReadableMatchOfClan(clanId: number) {
	const live = await findLiveMatchOfClan(clanId);
	if (live) return live;
	const event = await findVisibleChampionshipEvent();
	if (!event) return null;
	return prisma.clanChampionshipMatch.findFirst({
		where: {
			eventId: event.id,
			status: ClanChampionshipMatchStatus.finished,
			OR: [{ homeClanId: clanId }, { awayClanId: clanId }]
		},
		orderBy: { endsAt: 'desc' }
	});
}

type MatchSides = { homeClanId: number | null; awayClanId: number | null; westClanId: number | null };

/** Whether the home clan is the west one; a deleted west clan (null id) is the one whose id is null. */
export function westIsHomeOf(match: MatchSides) {
	return match.westClanId !== null ? match.westClanId === match.homeClanId : match.homeClanId === null;
}

/** Whether a (present) clan plays west, also when the west clan was deleted. */
export function isWestClan(match: MatchSides, clanId: number) {
	if (match.westClanId !== null) return clanId === match.westClanId;
	return clanId !== (westIsHomeOf(match) ? match.awayClanId : match.homeClanId);
}

export function sideOf(match: { westClanId: number | null }, clanId: number): Side {
	return match.westClanId === clanId ? 'west' : 'east';
}

type FighterResult = FightProcessResult['attackers'][number];

type Fought = {
	piece: PieceEntity;
	dinoz: Awaited<ReturnType<typeof getDinozForChampionshipFight>>[number];
};

/**
 * Plays the fight of a board attack (the attacker stays in place): 1v1 from behind, otherwise every piece
 * of the fight zone, by clan. Runs in the caller's transaction, under the match lock.
 */
export async function resolveBoardAttack(
	tx: LocalTransactionClient,
	match: MatchEntity,
	attacker: PieceEntity,
	defender: PieceEntity,
	_authed: Authed
): Promise<NonNullable<BoardMoveResult['fight']>> {
	let pieces: PieceEntity[];
	if (isBehindAttack(sideOf(match, defender.clanId), attacker as { x: number }, defender as { x: number })) {
		pieces = [attacker, defender];
	} else {
		const onBoard = await tx.clanChampionshipPiece.findMany({
			where: { matchId: match.id, state: ClanChampionshipPieceState.onBoard }
		});
		const zone = fightZone(attacker as { x: number; y: number }, defender as { x: number; y: number });
		pieces = onBoard.filter(p => p.x !== null && p.y !== null && zone.has(cellIndex(p.x, p.y)));
		for (const own of [attacker, defender]) {
			if (!pieces.some(p => p.id === own.id)) pieces.push(own);
		}
	}

	const rows = await getDinozForChampionshipFight(
		pieces.map(p => p.dinozId),
		tx
	);
	const fighters: Fought[] = [];
	for (const piece of pieces) {
		const dinoz = rows.find(r => r.id === piece.dinozId);
		if (dinoz && dinoz.life > 0) fighters.push({ piece, dinoz });
	}
	const teamA = fighters.filter(f => f.piece.clanId === attacker.clanId);
	const teamB = fighters.filter(f => f.piece.clanId !== attacker.clanId);

	const fight = calculateFightBetweenPlayers(
		CLAN_CHAMPIONSHIP_PVP_RULES,
		teamA.map(f => f.dinoz),
		teamA.some(f => f.dinoz.player.cooker),
		teamB.map(f => f.dinoz),
		teamB.some(f => f.dinoz.player.cooker),
		match.placeId as PlaceEnum
	);

	const archive = await archiveFight(
		fight,
		fight.outcome === FightOutcome.AttackerWin,
		attacker.playerId,
		defender.playerId,
		JSON.stringify({
			kind: 'clanChampionship',
			matchId: match.id,
			placeId: match.placeId,
			rightClanName: defender.clanId === match.homeClanId ? match.homeClanName : match.awayClanName
		}),
		tx
	);

	const config = gameConfig();
	const deadDinozIds: number[] = [];
	const contexts = (team: Fought[], opposing: Fought[], results: FighterResult[], opposingResults: FighterResult[]) => {
		const teamLevel = team.reduce((acc, f) => acc + f.dinoz.level, 0);
		const opponents = opposing.map(o => ({
			level: o.dinoz.level,
			life: o.dinoz.life,
			maxLife: o.dinoz.maxLife,
			escaped: opposingResults.find(r => r.dinozId === o.dinoz.id)?.escaped ?? false
		}));
		return team.map(f => ({ ...f, results, teamLevel, opponents }));
	};
	// Settled by dinoz id, whatever the team: other code paths lock dinoz ORDER BY id (deadlock avoidance).
	const participants = [
		...contexts(teamA, teamB, fight.attackers, fight.defenders),
		...contexts(teamB, teamA, fight.defenders, fight.attackers)
	].sort((x, y) => x.dinoz.id - y.dinoz.id);
	for (const { piece, dinoz, results, teamLevel, opponents } of participants) {
		const result = results.find(r => r.dinozId === dinoz.id);
		if (!result) continue;
		const dead = result.hpLost >= dinoz.life;
		const data: Prisma.DinozUpdateInput = { life: { decrement: Math.min(result.hpLost, dinoz.life) } };
		let xp = 0;
		if (!dead && !result.escaped) {
			xp = calculateXPBonus(dinoz, computePvpXp(dinoz, opponents, teamLevel), dinoz.player);
			if (dinoz.experience >= getMaxXp(dinoz, config)) xp = 0;
			data.experience = { increment: xp };
		}
		await tx.dinoz.update({ where: { id: dinoz.id }, data });
		await addLog(tx, LogType.XPEarned, dinoz, xp);
		await addLog(tx, LogType.HPLost, dinoz, result.hpLost);

		if (dead) {
			deadDinozIds.push(dinoz.id);
			await addLog(tx, LogType.Death, dinoz);
			await tx.clanChampionshipPiece.updateMany({
				where: { id: piece.id, state: ClanChampionshipPieceState.onBoard },
				data: { state: ClanChampionshipPieceState.dead, x: null, y: null, actionPoints: 0 }
			});
			await tx.dinoz.updateMany({
				where: { id: dinoz.id, unavailableReason: UnavailableReason.clanChampionship },
				data: { unavailableReason: null }
			});
		}
		for (const itemId of result.itemsUsed) {
			const item = await tx.dinozItem.findFirst({ where: { dinozId: dinoz.id, itemId }, select: { id: true } });
			if (item) await tx.dinozItem.delete({ where: { id: item.id } });
		}
	}

	await tx.clanChampionshipFight.create({
		data: {
			matchId: match.id,
			archiveId: archive.id,
			attackerClanId: attacker.clanId,
			attackerWon: fight.outcome === FightOutcome.AttackerWin,
			participantDinozIds: fighters.map(f => f.dinoz.id),
			participantPlayerIds: [...new Set(fighters.map(f => f.piece.playerId))],
			deadDinozIds
		}
	});

	return { archiveId: archive.id, outcome: fight.outcome, deadDinozIds };
}

function addLog(
	tx: LocalTransactionClient,
	type: LogType,
	dinoz: { id: number; playerId: string | null },
	...values: number[]
) {
	if (dinoz.playerId === null) return Promise.resolve();
	return tx.log.create({
		data: {
			player: { connect: { id: dinoz.playerId } },
			dinoz: { connect: { id: dinoz.id } },
			type,
			values: values.map(v => v.toString()),
			playerOldId: dinoz.playerId
		},
		select: { id: true }
	});
}

/** Runs an action on the player's live match, under the match lock and re-validating its liveness. */
async function withLiveMatch<T>(
	authed: Auth,
	action: (tx: LocalTransactionClient, match: MatchEntity, authed: Authed, clanId: number, side: Side) => Promise<T>
): Promise<T> {
	const noLiveMatch = () => new ExpectedError(translate('clanChampionship.noLiveMatch', authed));
	const clanId = authed.clanId;
	if (clanId === null || clanId === undefined) throw noLiveMatch();
	const found = await findLiveMatchOfClan(clanId);
	if (!found) throw noLiveMatch();

	const { result, version } = await prisma.$transaction(
		async tx => {
			await lockMatch(tx, found.id);
			const match = await tx.clanChampionshipMatch.findUnique({ where: { id: found.id } });
			// The cron may fire a few ms early: a match can still be live right after endsAt.
			if (!match || match.status !== ClanChampionshipMatchStatus.live || Date.now() >= match.endsAt.getTime()) {
				throw noLiveMatch();
			}
			const result = await action(tx, match, authed, clanId, sideOf(match, clanId));
			// One bump per action, whatever it touched (a fight included), in the action's own transaction.
			return { result, version: await bumpVersion(tx, match.id) };
		},
		{ timeout: 15000 }
	);
	publishBoardChanged(found, version);
	return result;
}

export async function enterBoard(authed: Auth, dinozId: number): Promise<void> {
	await withLiveMatch(authed, async (tx, match, authed, clanId, side) => {
		const fail = (key: string) => new ExpectedError(translate(`clanChampionship.${key}`, authed));
		// The membership may have changed since the match was found, before the lock.
		const membership = await tx.clanMember.findUnique({ where: { playerId: authed.id }, select: { clanId: true } });
		if (membership?.clanId !== clanId) throw fail('noLiveMatch');
		const dinoz = await tx.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				playerId: true,
				life: true,
				placeId: true,
				leaderId: true,
				unavailableReason: true,
				_count: { select: { followers: true } }
			}
		});
		if (!dinoz || dinoz.playerId !== authed.id) throw fail('notYourDinoz');
		if (dinoz.life <= 0) throw fail('dinozDead');
		if (dinoz.placeId !== match.placeId) throw fail('wrongPlace');
		if (dinoz.leaderId !== null || dinoz._count.followers > 0) throw fail('dinozInGroup');
		if (dinoz.unavailableReason !== null) throw fail('dinozBusy');

		const existing = await tx.clanChampionshipPiece.findUnique({
			where: { matchId_dinozId: { matchId: match.id, dinozId } }
		});
		if (existing?.state === ClanChampionshipPieceState.dead) throw fail('deadInMatch');
		if (!existing || existing.clanId !== clanId) {
			const used = await tx.clanChampionshipPiece.count({ where: { matchId: match.id, clanId } });
			if (used >= BOARD_MATCH_QUOTA) throw fail('quotaReached');
		}

		const onBoard = await tx.clanChampionshipPiece.findMany({
			where: { matchId: match.id, state: ClanChampionshipPieceState.onBoard },
			select: { x: true, y: true }
		});
		const occupied = new Set(onBoard.map(o => cellIndex(o.x as number, o.y as number)));
		const cell = pickEntryCell(side, occupied, seedrandom());
		if (!cell) throw fail('entryFull');

		const locked = await tx.dinoz.updateMany({
			where: { id: dinozId, unavailableReason: null, placeId: match.placeId, life: { gt: 0 } },
			data: { unavailableReason: UnavailableReason.clanChampionship }
		});
		if (locked.count === 0) throw fail('dinozBusy');

		await tx.clanChampionshipPiece.upsert({
			where: { matchId_dinozId: { matchId: match.id, dinozId } },
			create: {
				matchId: match.id,
				dinozId,
				playerId: authed.id,
				clanId,
				state: ClanChampionshipPieceState.onBoard,
				x: cell.x,
				y: cell.y,
				actionPoints: 0
			},
			update: {
				playerId: authed.id,
				clanId,
				state: ClanChampionshipPieceState.onBoard,
				x: cell.x,
				y: cell.y,
				actionPoints: 0
			}
		});
	});
}

export async function leaveBoard(authed: Auth, dinozId: number): Promise<void> {
	await withLiveMatch(authed, async (tx, match, authed, clanId, side) => {
		const fail = (key: string) => new ExpectedError(translate(`clanChampionship.${key}`, authed));
		const own = await tx.clanChampionshipPiece.findUnique({
			where: { matchId_dinozId: { matchId: match.id, dinozId } }
		});
		if (!own || own.state !== ClanChampionshipPieceState.onBoard) throw fail('notOnBoard');
		if (own.playerId !== authed.id || own.clanId !== clanId) throw fail('notYourDinoz');
		if (own.x !== entryColumn(side)) throw fail('notOnEntryColumn');

		await tx.clanChampionshipPiece.update({
			where: { id: own.id },
			data: { state: ClanChampionshipPieceState.left, x: null, y: null, actionPoints: 0 }
		});
		await tx.dinoz.updateMany({
			where: { id: dinozId, unavailableReason: UnavailableReason.clanChampionship },
			data: { unavailableReason: null }
		});
	});
}

export async function moveOnBoard(authed: Auth, dinozId: number, direction: BoardDirection): Promise<BoardMoveResult> {
	return withLiveMatch(authed, async (tx, match, authed, clanId, side) => {
		const fail = (key: string) => new ExpectedError(translate(`clanChampionship.${key}`, authed));
		const own = await tx.clanChampionshipPiece.findUnique({
			where: { matchId_dinozId: { matchId: match.id, dinozId } }
		});
		if (!own || own.state !== ClanChampionshipPieceState.onBoard || own.x === null || own.y === null) {
			throw fail('notOnBoard');
		}
		if (own.playerId !== authed.id || own.clanId !== clanId) throw fail('notYourDinoz');
		if (own.actionPoints < 1) throw fail('noActionPoints');

		const target = step(own.x, own.y, direction);
		if (!isInBounds(target.x, target.y)) throw fail('outOfBoard');
		if (match.obstacles.includes(cellIndex(target.x, target.y))) throw fail('obstacle');

		const onBoard = await tx.clanChampionshipPiece.findMany({
			where: { matchId: match.id, state: ClanChampionshipPieceState.onBoard }
		});
		const occupant = onBoard.find(o => o.x === target.x && o.y === target.y);
		if (occupant && occupant.clanId === clanId) throw fail('cellOccupied');

		if (!occupant) {
			// Attacking an enemy on its entry column is fine (the attacker stays); stopping there is not.
			if (target.x === entryColumn(side === 'west' ? 'east' : 'west')) throw fail('enemyEntryColumn');
			await tx.clanChampionshipPiece.update({
				where: { id: own.id },
				data: { x: target.x, y: target.y, actionPoints: { decrement: 1 } }
			});
			return { fight: null };
		}

		await tx.clanChampionshipPiece.update({ where: { id: own.id }, data: { actionPoints: { decrement: 1 } } });
		const fight = await resolveBoardAttack(tx, match, { ...own, actionPoints: own.actionPoints - 1 }, occupant, authed);
		return { fight };
	});
}

/** A player who left the clan takes their pieces off the live board (dead pieces stay for the record). */
export async function removePlayerFromBoards(playerId: string, clanId: number): Promise<void> {
	const found = await findLiveMatchOfClan(clanId);
	if (!found) return;
	const version = await prisma.$transaction(
		async tx => {
			await lockMatch(tx, found.id);
			const current = await tx.clanChampionshipMatch.findUnique({ where: { id: found.id } });
			if (!current || current.status !== ClanChampionshipMatchStatus.live) return null;
			const where = { matchId: found.id, playerId, state: { not: ClanChampionshipPieceState.dead } };
			const pieces = await tx.clanChampionshipPiece.findMany({ where, select: { dinozId: true } });
			if (pieces.length === 0) return null;
			await tx.clanChampionshipPiece.deleteMany({ where });
			await tx.dinoz.updateMany({
				where: {
					id: { in: pieces.map(piece => piece.dinozId) },
					unavailableReason: UnavailableReason.clanChampionship
				},
				data: { unavailableReason: null }
			});
			return bumpVersion(tx, found.id);
		},
		{ timeout: 15000 }
	);
	if (version !== null) publishBoardChanged(found, version);
}

type JournalRow = {
	id: number;
	createdAt: Date;
	attackerClanId: number;
	attackerWon: boolean;
	participantDinozIds: number[];
	participantPlayerIds: string[];
	deadDinozIds: number[];
	archiveId: string;
};

/** A journal line; the archive is only linked for a fight the reader took part in. */
function toJournalEntry(f: JournalRow, readerId: string): FightJournalEntryDTO {
	return {
		id: f.id,
		createdAt: f.createdAt,
		attackerClanId: f.attackerClanId,
		attackerWon: f.attackerWon,
		participantCount: f.participantDinozIds.length,
		deadDinozIds: f.deadDinozIds,
		archiveId: f.participantPlayerIds.includes(readerId) ? f.archiveId : null
	};
}

/** One older page of a match journal (`id < before`, newest first); only the two clans of the match may read it. */
export async function getMatchFights(authed: Auth, matchId: string, before: number): Promise<FightJournalEntryDTO[]> {
	const fail = (key: string) => new ExpectedError(translate(`clanChampionship.${key}`, authed));
	const clanId = authed.clanId;
	if (clanId === null || clanId === undefined) throw fail('noLiveMatch');
	const match = await prisma.clanChampionshipMatch.findUnique({ where: { id: matchId } });
	if (!match || (match.homeClanId !== clanId && match.awayClanId !== clanId)) throw fail('noLiveMatch');
	const event = await findVisibleChampionshipEvent();
	if (!event || event.id !== match.eventId) throw fail('noLiveMatch');

	const journal = await prisma.clanChampionshipFight.findMany({
		where: { matchId, id: { lt: before } },
		orderBy: { id: 'desc' },
		take: JOURNAL_PAGE_SIZE
	});
	return journal.map(f => toJournalEntry(f, authed.id));
}

/** The reader's clan board: its live match, else its latest finished match of the active championship. */
export async function getMyMatchBoard(authed: Auth): Promise<MatchBoardDTO | null> {
	const clanId = authed.clanId;
	if (clanId === null || clanId === undefined) return null;

	const match = await findReadableMatchOfClan(clanId);
	if (!match) return null;

	const all = await prisma.clanChampionshipPiece.findMany({
		where: { matchId: match.id },
		include: {
			dinoz: {
				select: {
					name: true,
					display: true,
					level: true,
					life: true,
					maxLife: true,
					player: { select: { name: true } }
				}
			}
		}
	});
	const onBoard = all.flatMap(piece =>
		piece.state === ClanChampionshipPieceState.onBoard && piece.x !== null && piece.y !== null
			? [{ ...piece, x: piece.x, y: piece.y }]
			: []
	);

	const westIsHome = westIsHomeOf(match);
	const isWest = (p: { clanId: number }) => isWestClan(match, p.clanId);
	const board = onBoard.map(p => ({ id: p.id, clanId: p.clanId, x: p.x, y: p.y }));
	const westPieces = board.filter(isWest);
	const eastPieces = board.filter(p => !isWest(p));
	const side = (isHome: boolean, pieces: typeof board, enemies: typeof board, which: Side) => {
		const id = isHome ? match.homeClanId : match.awayClanId;
		return {
			clanId: id,
			name: isHome ? match.homeClanName : match.awayClanName,
			score: isHome ? match.homeScore : match.awayScore,
			scoreLine: scoreLine(which, pieces, enemies),
			quotaUsed: all.filter(p => p.clanId === id).length
		};
	};

	const pieces: BoardPieceDTO[] = onBoard.map(p => {
		const mine = p.playerId === authed.id;
		const ally = !mine && p.clanId === clanId;
		const dto: BoardPieceDTO = {
			dinozId: p.dinozId,
			clanId: p.clanId,
			x: p.x,
			y: p.y,
			mine,
			ally,
			name: p.dinoz.name,
			display: p.dinoz.display,
			level: p.dinoz.level,
			playerName: p.dinoz.player?.name ?? ''
		};
		if (mine || ally) {
			dto.life = p.dinoz.life;
			dto.maxLife = p.dinoz.maxLife;
			dto.actionPoints = p.actionPoints;
		}
		return dto;
	});

	const journal = await prisma.clanChampionshipFight.findMany({
		where: { matchId: match.id },
		orderBy: { id: 'desc' },
		take: JOURNAL_PAGE_SIZE
	});
	const fights = journal.map(f => toJournalEntry(f, authed.id));

	return {
		matchId: match.id,
		version: match.version,
		round: match.round,
		placeId: match.placeId,
		status: match.status,
		startsAt: match.startsAt,
		endsAt: match.endsAt,
		ticksApplied: match.ticksApplied,
		west: side(westIsHome, westPieces, eastPieces, 'west'),
		east: side(!westIsHome, eastPieces, westPieces, 'east'),
		obstacles: match.obstacles,
		pieces,
		deadDinozIds: all.filter(p => p.state === ClanChampionshipPieceState.dead).map(p => p.dinozId),
		fights
	};
}
