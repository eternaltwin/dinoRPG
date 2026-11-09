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
 * The whole match, frame by frame, with both clans' life and action points. Only once the match is over (it would
 * reveal the enemy's state otherwise), and only to the two clans that played it, whatever the championship.
 */
export async function getMatchReplay(authed: Auth, matchId: string): Promise<MatchReplayDTO> {
	const unavailable = () => new ExpectedError(translate('clanChampionship.replayUnavailable', authed));
	const clanId = authed.clanId;
	if (clanId === null || clanId === undefined) throw unavailable();
	const match = await prisma.clanChampionshipMatch.findUnique({ where: { id: matchId } });
	if (!match || (match.homeClanId !== clanId && match.awayClanId !== clanId)) throw unavailable();
	if (match.status !== ClanChampionshipMatchStatus.finished) throw unavailable();

	const rows = await prisma.clanChampionshipFrame.findMany({ where: { matchId }, orderBy: { version: 'asc' } });
	const frames: ReplayFrameDTO[] = rows.map(f => {
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
		dinoz,
		frames
	};
}
