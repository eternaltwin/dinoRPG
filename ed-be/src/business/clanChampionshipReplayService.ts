import {
	MatchReplayDTO,
	ReplayDinozDTO,
	ReplayEvent,
	ReplayFrameDTO,
	ReplayPieceState,
	ReplayPieceStateCode
} from '@drpg/core/models/clan/clanChampionship';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ClanChampionshipMatchStatus } from '@drpg/prisma';
import { Auth } from '../dao/playerDao.js';
import { prisma } from '../prisma.js';
import { scoreLine } from '../utils/clanChampionship/board.js';
import translate from '../utils/server/translate.js';
import { isWestClan, westIsHomeOf } from './clanChampionshipMatchService.js';

/**
 * The whole match, frame by frame, only to the two clans that played it, whatever the championship. Once the match
 * is over, both clans' life and action points; while it is live, only what the board shows the reader: the enemy's
 * life and action points are zeroed, its heals left out, and no fight archive is given.
 */
export async function getMatchReplay(authed: Auth, matchId: string): Promise<MatchReplayDTO> {
	const unavailable = () => new ExpectedError(translate('clanChampionship.replayUnavailable', authed));
	const clanId = authed.clanId;
	if (clanId === null || clanId === undefined) throw unavailable();
	const match = await prisma.clanChampionshipMatch.findUnique({ where: { id: matchId } });
	if (!match || (match.homeClanId !== clanId && match.awayClanId !== clanId)) throw unavailable();
	if (match.status === ClanChampionshipMatchStatus.scheduled) throw unavailable();
	const omniscient = match.status === ClanChampionshipMatchStatus.finished;

	const rows = await prisma.clanChampionshipFrame.findMany({ where: { matchId }, orderBy: { version: 'asc' } });
	const visible = omniscient ? rows : rows.flatMap(f => hideEnemyState(f, clanId));
	const frames: ReplayFrameDTO[] = visible.map(f => {
		const pieces = f.pieces as unknown as ReplayPieceState[];
		const board = pieces
			.filter(p => p[2] === ReplayPieceStateCode.ON_BOARD)
			.map(([dinozId, clanId, , x, y]) => ({ id: dinozId, clanId, x, y }));
		const west = board.filter(p => isWestClan(match, p.clanId));
		const east = board.filter(p => !isWestClan(match, p.clanId));
		return {
			version: f.version,
			at: f.createdAt,
			events: f.events as unknown as ReplayEvent[],
			homeScore: f.homeScore,
			awayScore: f.awayScore,
			ticksApplied: f.ticksApplied,
			pieces,
			westScoreLine: scoreLine('west', west, east),
			eastScoreLine: scoreLine('east', east, west)
		};
	});

	const dinozIds = [...new Set(frames.flatMap(f => f.pieces.map(p => p[0])))];
	const found = await prisma.dinoz.findMany({
		where: { id: { in: dinozIds } },
		select: { id: true, name: true, display: true, level: true, player: { select: { name: true } } }
	});
	// A dinoz deleted since the match is still part of its record, without its looks
	const dinoz: ReplayDinozDTO[] = dinozIds.map(id => {
		const row = found.find(d => d.id === id);
		return {
			dinozId: id,
			name: row?.name ?? '?',
			display: row?.display ?? '',
			level: row?.level ?? 0,
			playerName: row?.player?.name ?? ''
		};
	});

	return {
		matchId: match.id,
		round: match.round,
		placeId: match.placeId,
		startsAt: match.startsAt,
		endsAt: match.endsAt,
		home: { clanId: match.homeClanId, name: match.homeClanName },
		away: { clanId: match.awayClanId, name: match.awayClanName },
		westIsHome: westIsHomeOf(match),
		obstacles: match.obstacles,
		homeScore: match.homeScore,
		awayScore: match.awayScore,
		winnerClanId: match.winnerClanId,
		omniscient,
		dinoz,
		frames
	};
}

type FrameRow = { pieces: unknown; events: unknown };

/**
 * A live frame as the reader's clan sees the board: no life nor action points of the enemy, no enemy heal (a frame
 * made only of those is left out) and no fight archive.
 */
function hideEnemyState<F extends FrameRow>(frame: F, readerClanId: number): F[] {
	const events = (frame.events as ReplayEvent[]).flatMap((e): ReplayEvent[] => {
		if (e.type === 'attack') return [{ ...e, archiveId: '' }];
		if (e.type === 'heal' && !ownedBy(frame, e.dinozId, readerClanId)) return [];
		return [e];
	});
	if (events.length === 0 && (frame.events as ReplayEvent[]).length > 0) return [];
	const pieces = (frame.pieces as ReplayPieceState[]).map(
		(p): ReplayPieceState => (p[1] === readerClanId ? p : [p[0], p[1], p[2], p[3], p[4], 0, 0, 0])
	);
	return [{ ...frame, events, pieces }];
}

function ownedBy(frame: FrameRow, dinozId: number, clanId: number): boolean {
	return (frame.pieces as ReplayPieceState[]).some(p => p[0] === dinozId && p[1] === clanId);
}
