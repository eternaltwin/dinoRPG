import { http } from '@/utils';
import { DinozShop, Item } from '@/models';
export const ShopService = {
	getDinozFromDinozShop(): Promise<Array<DinozShop>> {
		return http()
			.get(`/shop/dinoz`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getItemFromItemShop(): Promise<Array<Item>> {
		return http()
			.get(`/shop/item`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
