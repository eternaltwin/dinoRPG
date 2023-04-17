import { http } from '../utils/index.js';
import { DinozShopFiche } from '@drpg/core/src/models/shop/DinozShopFiche.mjs';
export const DinozShopService = {
	getDinozFromDinozShop(): Promise<Array<DinozShopFiche>> {
		return http()
			.get(`/shop/dinoz`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
