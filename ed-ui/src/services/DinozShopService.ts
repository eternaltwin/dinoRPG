import { http } from '../utils/index.js';
import { DinozShopFicheLite } from '@drpg/core/models/shop/DinozShopFiche';
export const DinozShopService = {
	getDinozFromDinozShop(): Promise<Array<DinozShopFicheLite>> {
		return http()
			.get(`/shop/dinoz`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
