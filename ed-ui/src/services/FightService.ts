import { http } from '../utils/index.js';
import { FightResult } from '@drpg/core/models/fight/FightResult';

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
