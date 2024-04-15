import { http } from '../utils/index.js';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { ShopFeedBack } from '@drpg/core/models/shop/shopFeedBack';
export const ItemShopService = {
	getItemFromItemShop(shopId: number): Promise<Array<ItemFiche>> {
		return http()
			.get(`/shop/getShop/${shopId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	buyItem(shopId: number, itemId: number, quantity: number): Promise<ShopFeedBack> {
		return http()
			.put(`/shop/buyItem/${shopId}`, {
				itemId: itemId,
				quantity: quantity
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
