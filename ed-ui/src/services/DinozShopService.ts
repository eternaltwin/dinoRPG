import { http } from '../utils';
import { DinozShop } from '../models';
export const DinozShopService = {
	getDinozFromDinozShop(): Promise<Array<DinozShop>> {
		return http()
			.get(`/shop/dinoz`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
