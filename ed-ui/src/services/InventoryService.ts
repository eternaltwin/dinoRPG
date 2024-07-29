import { http } from '../utils/index.js';
import { ItemFicheDTO } from '@drpg/core/models/item/ItemFiche';
import { DinozItems } from '@drpg/core/models/item/DinozItems';
import { ItemFeedBack } from '@drpg/core/models/item/feedBack';

// For Player's inventory

export const InventoryService = {
	getAllItemsData(): Promise<Array<ItemFicheDTO>> {
		return http()
			.get('/inventory/all')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},

	useInventoryItem(itemId: number, dinozId: number): Promise<ItemFeedBack> {
		return http()
			.get(`/inventory/${dinozId}/${itemId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	equipInventoryItem(dinozId: number, itemId: number, equip: boolean): Promise<Array<DinozItems>> {
		return http()
			.put(`/inventory/${dinozId}`, { itemId: itemId, equip: equip })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
