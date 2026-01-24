import { GetStatRankingsResponse } from '@drpg/core/returnTypes/Ranking';
import { http } from '../utils/index.js';

export const RankingService = {
	async getStatRankings(): Promise<GetStatRankingsResponse> {
		const res = await http().get('/ranking/stats');
		return res.data;
	}
};
