import { http } from '../utils/index.js';
import { FightResult } from '@drpg/core/models/fight/FightResult';

export const FightService = {
	async processFight(dinozId: number): Promise<FightResult> {
		const res = await http().put(`/fight`, {
			dinozId: dinozId
		});
		return res.data;
	}
};
