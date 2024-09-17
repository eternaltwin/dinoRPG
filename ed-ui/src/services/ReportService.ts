import { http } from '../utils/index.js';

export const ReportService = {
	getPlayer(playerId: number) {
		return http()
			.get(`/moderation/player/${playerId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	reportPlayer(playerId: number, reason: string, comment: string, dinozId?: number) {
		return http()
			.put(`/moderation/player/${playerId}`, {
				reason: reason,
				comment: comment,
				dinozId: dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
