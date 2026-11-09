import { ReplayPieceStateCode } from '@drpg/core/models/clan/clanChampionship';
import type {
	BoardPieceDTO,
	BoardSideDTO,
	MatchBoardDTO,
	MatchReplayDTO,
	ReplayFrameDTO
} from '@drpg/core/models/clan/clanChampionship';

type ReplayClan = MatchReplayDTO['home'];

export function westClanOf(replay: MatchReplayDTO): ReplayClan {
	return replay.westIsHome ? replay.home : replay.away;
}

export function eastClanOf(replay: MatchReplayDTO): ReplayClan {
	return replay.westIsHome ? replay.away : replay.home;
}

export function isWestClanOf(replay: MatchReplayDTO, clanId: number): boolean {
	const west = westClanOf(replay);
	if (west.clanId !== null) return clanId === west.clanId;
	return clanId !== eastClanOf(replay).clanId;
}

/**
 * The board of one replay frame, read-only (no piece is `mine`). On a live replay, life and action points are only
 * given for the reader's clan, as on the live board.
 */
export function frameToBoard(replay: MatchReplayDTO, frame: ReplayFrameDTO, readerClanId?: number): MatchBoardDTO {
	const dinozById = new Map(replay.dinoz.map(d => [d.dinozId, d]));
	const pieces: BoardPieceDTO[] = frame.pieces
		.filter(p => p[2] === ReplayPieceStateCode.ON_BOARD)
		.map(([dinozId, clanId, , x, y, actionPoints, life, maxLife]) => {
			const dinoz = dinozById.get(dinozId);
			const ally = clanId === readerClanId;
			const piece: BoardPieceDTO = {
				dinozId,
				clanId,
				x,
				y,
				mine: false,
				ally,
				name: dinoz?.name ?? '?',
				display: dinoz?.display ?? '',
				level: dinoz?.level ?? 0,
				playerName: dinoz?.playerName ?? ''
			};
			if (replay.omniscient || ally) Object.assign(piece, { life, maxLife, actionPoints });
			return piece;
		});
	const side = (clan: ReplayClan, west: boolean): BoardSideDTO => ({
		clanId: clan.clanId,
		name: clan.name,
		score: west === replay.westIsHome ? frame.homeScore : frame.awayScore,
		scoreLine: west ? frame.westScoreLine : frame.eastScoreLine,
		quotaUsed: frame.pieces.filter(p => isWestClanOf(replay, p[1]) === west).length
	});
	const ended = frame.events.some(e => e.type === 'end');
	return {
		matchId: replay.matchId,
		version: frame.version,
		round: replay.round,
		placeId: replay.placeId,
		status: ended ? 'finished' : 'live',
		startsAt: replay.startsAt,
		endsAt: replay.endsAt,
		ticksApplied: frame.ticksApplied,
		west: side(westClanOf(replay), true),
		east: side(eastClanOf(replay), false),
		obstacles: replay.obstacles,
		pieces,
		deadDinozIds: frame.pieces.filter(p => p[2] === ReplayPieceStateCode.DEAD).map(p => p[0]),
		fights: []
	};
}

/** The dinoz a frame is about, to point out on the board. */
export function frameActors(frame: ReplayFrameDTO | null): number[] {
	const ids: number[] = [];
	for (const e of frame?.events ?? []) {
		if ('dinozId' in e) ids.push(e.dinozId);
		if (e.type === 'attack') ids.push(e.targetDinozId, ...e.deadDinozIds);
		if (e.type === 'withdrawn') ids.push(...e.dinozIds);
	}
	return [...new Set(ids)];
}
