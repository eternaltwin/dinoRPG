import {
	BOARD_MATCH_QUOTA,
	BOARD_TICK_AP,
	BOARD_TICK_MINUTES,
	BoardDirection,
	PLACE_REVEAL_HOURS
} from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ClanChampionshipMatchStatus, ClanChampionshipPieceState, UnavailableReason } from '@drpg/prisma';
import { CronJob } from 'cron';
import { Request } from 'express';
import seedrandom from 'seedrandom';
import { LocalTransactionClient } from '../dao/clansDao.js';
import { auth } from '../dao/playerDao.js';
import { prisma } from '../prisma.js';
import {
	cellIndex,
	entryColumn,
	generateObstacles,
	isInBounds,
	pickEntryCell,
	scoreLine,
	Side,
	step
} from '../utils/clanChampionship/board.js';
import translate from '../utils/server/translate.js';
import { getRandomArrayElement } from '../utils/tools.js';
import { findActiveChampionshipEvent, parseEventConfig } from './clanEventService.js';
import { finishChampionship, runChampionshipJob } from './clanChampionshipService.js';

const HOUR_MS = 60 * 60 * 1000;
const TICK_MS = BOARD_TICK_MINUTES * 60 * 1000;
const MAX_TICKS = 288;

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

/** Reveals the place of a match by drawing it among the championship places. */
export async function drawMatchPlace(tx: LocalTransactionClient, match: { id: string }, places: PlaceEnum[]) {
	await tx.clanChampionshipMatch.update({
		where: { id: match.id },
		data: { placeId: getRandomArrayElement(places) }
	});
}

async function processMatch(matchId: string, places: PlaceEnum[], now: Date): Promise<void> {
	await prisma.$transaction(
		async tx => {
			await lockMatch(tx, matchId);
			const match = await tx.clanChampionshipMatch.findUnique({ where: { id: matchId } });
			if (!match || match.status === ClanChampionshipMatchStatus.finished) return;

			const data: Record<string, unknown> = {};
			let status = match.status;
			let westClanId = match.westClanId;
			let ticksApplied = match.ticksApplied;
			let homeScore = match.homeScore;
			let awayScore = match.awayScore;

			if (match.placeId === null && now.getTime() >= match.startsAt.getTime() - PLACE_REVEAL_HOURS * HOUR_MS) {
				await drawMatchPlace(tx, match as MatchRow, places);
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
					const westIsHome = westClanId !== null ? westClanId === match.homeClanId : match.homeClanId === null;
					const eastId = westIsHome ? match.awayClanId : match.homeClanId;
					const isWest = (p: { clanId: number }) =>
						westClanId !== null ? p.clanId === westClanId : p.clanId !== eastId;
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

			if (Object.keys(data).length > 0) {
				await tx.clanChampionshipMatch.update({ where: { id: matchId }, data });
			}
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
		select: { id: true }
	});
	for (const { id } of open) {
		await runChampionshipJob(`championshipMatch_${id}`, () => processMatch(id, config.places, now))();
	}

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

type Authed = Awaited<ReturnType<typeof auth>>;
type MatchEntity = NonNullable<Awaited<ReturnType<typeof prisma.clanChampionshipMatch.findUnique>>>;
type PieceEntity = NonNullable<Awaited<ReturnType<typeof prisma.clanChampionshipPiece.findUnique>>>;

export type BoardMoveResult = {
	fight: { archiveId: string; outcome: FightOutcome; deadDinozIds: number[] } | null;
};

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

export function sideOf(match: { westClanId: number | null }, clanId: number): Side {
	return match.westClanId === clanId ? 'west' : 'east';
}

/**
 * Placeholder replaced by the fight resolution: the attacker stays in place, the fight is played
 * between the attacker and the defender pieces.
 */
export async function resolveBoardAttack(
	_tx: LocalTransactionClient,
	_match: MatchEntity,
	_attacker: PieceEntity,
	_defender: { id: number; clanId: number; x: number | null; y: number | null },
	_authed: Authed
): Promise<BoardMoveResult['fight']> {
	throw new Error('resolveBoardAttack not implemented');
}

/** Runs an action on the player's live match, under the match lock and re-validating its liveness. */
async function withLiveMatch<T>(
	req: Request,
	action: (tx: LocalTransactionClient, match: MatchEntity, authed: Authed, clanId: number, side: Side) => Promise<T>
): Promise<T> {
	const authed = await auth(req);
	const noLiveMatch = () => new ExpectedError(translate('clanChampionship.noLiveMatch', authed));
	const clanId = authed.clanId;
	if (clanId === null || clanId === undefined) throw noLiveMatch();
	const found = await findLiveMatchOfClan(clanId);
	if (!found) throw noLiveMatch();

	return prisma.$transaction(
		async tx => {
			await lockMatch(tx, found.id);
			const match = await tx.clanChampionshipMatch.findUnique({ where: { id: found.id } });
			// The cron may fire a few ms early: a match can still be live right after endsAt.
			if (!match || match.status !== ClanChampionshipMatchStatus.live || Date.now() >= match.endsAt.getTime()) {
				throw noLiveMatch();
			}
			return action(tx, match, authed, clanId, sideOf(match, clanId));
		},
		{ timeout: 15000 }
	);
}

export async function enterBoard(req: Request): Promise<void> {
	const dinozId = Number(req.body.dinozId);
	await withLiveMatch(req, async (tx, match, authed, clanId, side) => {
		const fail = (key: string) => new ExpectedError(translate(`clanChampionship.${key}`, authed));
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
		if (!existing) {
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
			update: { state: ClanChampionshipPieceState.onBoard, x: cell.x, y: cell.y, actionPoints: 0 }
		});
		await tx.dinoz.update({ where: { id: dinozId }, data: { unavailableReason: UnavailableReason.clanChampionship } });
	});
}

export async function leaveBoard(req: Request): Promise<void> {
	const dinozId = Number(req.body.dinozId);
	await withLiveMatch(req, async (tx, match, authed, _clanId, side) => {
		const fail = (key: string) => new ExpectedError(translate(`clanChampionship.${key}`, authed));
		const own = await tx.clanChampionshipPiece.findUnique({
			where: { matchId_dinozId: { matchId: match.id, dinozId } }
		});
		if (!own || own.state !== ClanChampionshipPieceState.onBoard) throw fail('notOnBoard');
		if (own.playerId !== authed.id) throw fail('notYourDinoz');
		if (own.x !== entryColumn(side)) throw fail('notOnEntryColumn');

		await tx.clanChampionshipPiece.update({
			where: { id: own.id },
			data: { state: ClanChampionshipPieceState.left, x: null, y: null, actionPoints: 0 }
		});
		await tx.dinoz.update({ where: { id: dinozId }, data: { unavailableReason: null } });
	});
}

export async function moveOnBoard(req: Request): Promise<BoardMoveResult> {
	const dinozId = Number(req.body.dinozId);
	const direction = req.body.direction as BoardDirection;
	return withLiveMatch(req, async (tx, match, authed, clanId) => {
		const fail = (key: string) => new ExpectedError(translate(`clanChampionship.${key}`, authed));
		const own = await tx.clanChampionshipPiece.findUnique({
			where: { matchId_dinozId: { matchId: match.id, dinozId } }
		});
		if (!own || own.state !== ClanChampionshipPieceState.onBoard || own.x === null || own.y === null) {
			throw fail('notOnBoard');
		}
		if (own.playerId !== authed.id) throw fail('notYourDinoz');
		if (own.actionPoints < 1) throw fail('noActionPoints');

		const target = step(own.x, own.y, direction);
		if (!isInBounds(target.x, target.y)) throw fail('outOfBoard');
		if (match.obstacles.includes(cellIndex(target.x, target.y))) throw fail('obstacle');

		const onBoard = await tx.clanChampionshipPiece.findMany({
			where: { matchId: match.id, state: ClanChampionshipPieceState.onBoard },
			select: { id: true, clanId: true, x: true, y: true }
		});
		const occupant = onBoard.find(o => o.x === target.x && o.y === target.y);
		if (occupant && occupant.clanId === clanId) throw fail('cellOccupied');

		if (!occupant) {
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
	await prisma.$transaction(
		async tx => {
			await lockMatch(tx, found.id);
			const where = { matchId: found.id, playerId, state: { not: ClanChampionshipPieceState.dead } };
			const pieces = await tx.clanChampionshipPiece.findMany({ where, select: { dinozId: true } });
			if (pieces.length === 0) return;
			await tx.clanChampionshipPiece.deleteMany({ where });
			await tx.dinoz.updateMany({
				where: {
					id: { in: pieces.map(piece => piece.dinozId) },
					unavailableReason: UnavailableReason.clanChampionship
				},
				data: { unavailableReason: null }
			});
		},
		{ timeout: 15000 }
	);
}
