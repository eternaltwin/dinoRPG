import { http } from '../utils';
import { Item } from '../models';
export const ItemShopService = {
	getItemFromItemShop(shopId: number): Promise<Array<Item>> {
		return http()
			.get(`/shop/getShop/${shopId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	buyItem(shopId: number, itemId: number, quantity: number): Promise<Item> {
		return http()
			.put(`/shop/buyItem/${shopId}`, {
				itemId: itemId,
				quantity: quantity
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
