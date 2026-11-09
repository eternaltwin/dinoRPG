import { ReplayEvent, ReplayPieceState, ReplayPieceStateCode } from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipPieceState, Prisma } from '@drpg/prisma';
import { LocalTransactionClient } from './clansDao.js';

const STATE_CODES: Record<ClanChampionshipPieceState, ReplayPieceStateCode> = {
	[ClanChampionshipPieceState.onBoard]: ReplayPieceStateCode.ON_BOARD,
	[ClanChampionshipPieceState.left]: ReplayPieceStateCode.LEFT,
	[ClanChampionshipPieceState.dead]: ReplayPieceStateCode.DEAD
};

/**
 * Writes the replay frame of a board version: every piece of the match, both clans, with its life and action points.
 * Runs in the transaction that made the version, under the match lock, once the board is settled.
 */
export async function recordFrame(
	tx: LocalTransactionClient,
	matchId: string,
	version: number,
	events: ReplayEvent[]
): Promise<void> {
	const match = await tx.clanChampionshipMatch.findUnique({
		where: { id: matchId },
		select: { homeScore: true, awayScore: true, ticksApplied: true }
	});
	if (!match) return;
	const pieces = await tx.clanChampionshipPiece.findMany({
		where: { matchId },
		orderBy: { id: 'asc' },
		select: {
			dinozId: true,
			clanId: true,
			state: true,
			x: true,
			y: true,
			actionPoints: true,
			dinoz: { select: { life: true, maxLife: true } }
		}
	});
	const encoded: ReplayPieceState[] = pieces.map(p => [
		p.dinozId,
		p.clanId,
		STATE_CODES[p.state],
		p.x ?? -1,
		p.y ?? -1,
		p.actionPoints,
		Math.max(0, p.dinoz.life),
		p.dinoz.maxLife
	]);
	await tx.clanChampionshipFrame.create({
		data: {
			matchId,
			version,
			events: events as unknown as Prisma.InputJsonValue,
			homeScore: match.homeScore,
			awayScore: match.awayScore,
			ticksApplied: match.ticksApplied,
			pieces: encoded as unknown as Prisma.InputJsonValue
		},
		select: { id: true }
	});
}
