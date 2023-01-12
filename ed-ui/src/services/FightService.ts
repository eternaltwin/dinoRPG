import { http } from '@/utils';
import { FightResult } from '@/models';

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
