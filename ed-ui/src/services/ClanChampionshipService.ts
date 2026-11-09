import { http } from '../utils/index.js';
import {
	BoardDirection,
	BoardMoveResult,
	ClanChampionshipDTO,
	FightJournalEntryDTO,
	MatchBoardDTO,
	MatchReplayDTO
} from '@drpg/core/models/clan/clanChampionship';
import { WsClanAction } from '@drpg/core/models/serverEvents/WsClanSocket';
import { clanSocket } from './clanSocket.js';

export const ClanChampionshipService = {
	/** Over HTTP: any player reads it, including from another clan's page or without a clan (so without a clan socket). */
	async getCurrent(): Promise<ClanChampionshipDTO | null> {
		const res = await http().get(`/clan/championship`);
		return res.data;
	},
	/** Over HTTP: a whole match, too big for a socket message. */
	async getReplay(matchId: string): Promise<MatchReplayDTO> {
		const res = await http().get(`/clan/championship/match/${matchId}/replay`);
		return res.data;
	},
	async register(): Promise<void> {
		await clanSocket.request(WsClanAction.CHAMPIONSHIP_REGISTER);
	},
	async unregister(): Promise<void> {
		await clanSocket.request(WsClanAction.CHAMPIONSHIP_UNREGISTER);
	},
	getMatch(): Promise<MatchBoardDTO | null> {
		return clanSocket.request(WsClanAction.CHAMPIONSHIP_GET_MATCH);
	},
	getFights(matchId: string, before: number): Promise<FightJournalEntryDTO[]> {
		return clanSocket.request(WsClanAction.CHAMPIONSHIP_GET_FIGHTS, { matchId, before });
	},
	async enter(dinozId: number): Promise<void> {
		await clanSocket.request(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId });
	},
	async leave(dinozId: number): Promise<void> {
		await clanSocket.request(WsClanAction.CHAMPIONSHIP_LEAVE, { dinozId });
	},
	move(dinozId: number, direction: BoardDirection): Promise<BoardMoveResult> {
		return clanSocket.request(WsClanAction.CHAMPIONSHIP_MOVE, { dinozId, direction });
	}
};
