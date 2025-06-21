import { GetStatRankingsResponse } from '@drpg/core/returnTypes/Ranking';
import { http } from '../utils/index.js';

export const RankingService = {
	async getStatRankings(): Promise<GetStatRankingsResponse> {
		try {
			const res = await http().get('/ranking/stats');
			return await Promise.resolve(res.data);
		} catch (err) {
			return await Promise.reject(err);
		}
	}
};
