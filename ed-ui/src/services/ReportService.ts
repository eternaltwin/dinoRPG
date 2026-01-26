import { http } from '../utils/index.js';

export const ReportService = {
	async getPlayer(playerId: string) {
		const res = await http().get(`/moderation/player/${playerId}`);
		return res.data;
	},
	async reportPlayer(playerId: string, reason: string, comment: string, dinozId?: number) {
		const res = await http().post(`/moderation/player/${playerId}`, {
			reason: reason,
			comment: comment,
			dinozId: dinozId
		});
		return res.data;
	}
};
