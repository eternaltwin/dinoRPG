import { http } from '../utils/index.js';
import { FightResult } from '@drpg/core/dist/models/fight/FightResult.mjs';

export const FightService = {
	processFight(dinozId: number): Promise<FightResult> {
		return http()
			.put(`/fight`, {
				dinozId: dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
