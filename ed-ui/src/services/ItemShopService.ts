import { http } from '../utils/index.js';
import { ShopFeedBack } from '@drpg/core/models/shop/shopFeedBack';
import { ItemShopFiche } from '@drpg/core/models/shop/ShopFiche';
export const ItemShopService = {
	async getItemFromItemShop(shopId: number): Promise<Array<ItemShopFiche>> {
		const res = await http().get(`/shop/getShop/${shopId}`);
		return res.data;
	},
	async buyItem(shopId: number, itemId: number, quantity: number): Promise<ShopFeedBack> {
		const res = await http().put(`/shop/buyItem/${shopId}`, {
			itemId: itemId,
			quantity: quantity
		});
		return res.data;
	}
};
