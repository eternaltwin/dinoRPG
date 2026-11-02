import { BOARD_TICK_AP, BOARD_TICK_MINUTES, PLACE_REVEAL_HOURS } from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ClanChampionshipMatchStatus, ClanChampionshipPieceState, UnavailableReason } from '@drpg/prisma';
import { CronJob } from 'cron';
import seedrandom from 'seedrandom';
import { LocalTransactionClient } from '../dao/clansDao.js';
import { prisma } from '../prisma.js';
import { generateObstacles, scoreLine } from '../utils/clanChampionship/board.js';
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
