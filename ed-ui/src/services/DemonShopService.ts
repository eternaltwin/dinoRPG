import { http } from '../utils/index.js';
import { demonShopFiche } from '@drpg/core/models/shop/demonShopFiche';

export const DemonShopService = {
	async getDemonDinozShop(): Promise<demonShopFiche> {
		const res = await http().get(`/demon`);
		return res.data;
	}
};
