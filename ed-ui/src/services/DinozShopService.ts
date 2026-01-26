import { http } from '../utils/index.js';
import { DinozShopFicheLite } from '@drpg/core/models/shop/DinozShopFiche';
export const DinozShopService = {
	async getDinozFromDinozShop(): Promise<Array<DinozShopFicheLite>> {
		const res = await http().get(`/shop/dinoz`);
		return res.data;
	}
};
