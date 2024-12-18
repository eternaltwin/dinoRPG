import { http } from '../utils/index.js';

export const ReportService = {
	getPlayer(playerId: string) {
		return http()
			.get(`/moderation/player/${playerId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	reportPlayer(playerId: string, reason: string, comment: string, dinozId?: number) {
		return http()
			.post(`/moderation/player/${playerId}`, {
				reason: reason,
				comment: comment,
				dinozId: dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
