import { PantheonMotif } from '@drpg/prisma';
import { http } from '../utils/index.js';
import { PantheonDisplay } from '@drpg/core/models/pantheon/pantheonDisplay';

export const DataService = {
	async getPantheon(
		type: PantheonMotif,
		level: number | null = null,
		race: string | null = null,
		rewardId: number | null = null
	): Promise<PantheonDisplay[]> {
		const res = await http().get(`/pantheon/${type}`, {
			params: {
				level,
				race,
				rewardId
			}
		});
		return res.data;
	}
};
