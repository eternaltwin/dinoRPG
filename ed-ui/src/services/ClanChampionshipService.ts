import { http } from '../utils/index.js';
import {
	BoardDirection,
	BoardMoveResult,
	ClanChampionshipDTO,
	MatchBoardDTO
} from '@drpg/core/models/clan/clanChampionship';

export const ClanChampionshipService = {
	async getCurrent(): Promise<ClanChampionshipDTO | null> {
		const res = await http().get(`/clan/championship`);
		return res.data;
	},
	async register(): Promise<void> {
		await http().post(`/clan/championship/registration`);
	},
	async unregister(): Promise<void> {
		await http().delete(`/clan/championship/registration`);
	},
	async getMatch(): Promise<MatchBoardDTO | null> {
		const res = await http().get(`/clan/championship/match`);
		return res.data;
	},
	async enter(dinozId: number): Promise<void> {
		await http().post(`/clan/championship/match/enter`, { dinozId });
	},
	async leave(dinozId: number): Promise<void> {
		await http().post(`/clan/championship/match/leave`, { dinozId });
	},
	async move(dinozId: number, direction: BoardDirection): Promise<BoardMoveResult> {
		const res = await http().post(`/clan/championship/match/move`, { dinozId, direction });
		return res.data;
	}
};
