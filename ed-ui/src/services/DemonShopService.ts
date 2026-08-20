import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { http } from '../utils/index.js';
import { demonShopFiche } from '@drpg/core/models/shop/demonShopFiche';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';

export const DemonShopService = {
	async getDemonDinozShop(): Promise<demonShopFiche> {
		const res = await http().get(`/demon`);
		return res.data;
	},
	async getSacrificedDinoz(page: number): Promise<DinozShopFiche[]> {
		const res = await http().get(`/demon/sacrificed/${page}`);
		return res.data;
	},
	async sacrificeDinoz(dinozId: number): Promise<number> {
		const res = await http().post(`/demon/sacrifice/${dinozId}`);
		return res.data;
	},
	async buyDinoz(dinozId: number): Promise<DinozFiche> {
		const res = await http().post(`/demon/buy/${dinozId}`);
		return res.data;
	},
	async unsacrificeDinoz(dinozId: number): Promise<void> {
		const res = await http().post(`/demon/unsacrifice/${dinozId}`);
		return res.data;
	}
};
