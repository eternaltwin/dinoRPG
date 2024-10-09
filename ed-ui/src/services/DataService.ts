import { http } from '../utils/index.js';
import { PantheonMotif } from '@drpg/core/models/enums/PantheonMotif';
import { PantheonDisplay } from '@drpg/core/models/pantheon/pantheonDisplay';

export const DataService = {
	getPantheon(
		type: PantheonMotif,
		level: number | null = null,
		race: string | null = null,
		rewardId: number | null = null
	): Promise<PantheonDisplay[]> {
		return http()
			.get(`/pantheon/${type}`, {
				params: {
					level,
					race,
					rewardId
				}
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
