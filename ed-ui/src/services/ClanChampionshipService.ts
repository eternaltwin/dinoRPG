import { http } from '../utils/index.js';
import { ClanChampionshipDTO } from '@drpg/core/models/clan/clanChampionship';

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
	}
};
