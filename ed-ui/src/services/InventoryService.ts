import { http } from '../utils/index.js';
import { ItemFicheDTO } from '@drpg/core/models/item/ItemFiche';
import { DinozItems } from '@drpg/core/models/item/DinozItems';
import { ItemFeedBack } from '@drpg/core/models/item/feedBack';

// For Player's inventory

export const InventoryService = {
	async getAllItemsData(): Promise<Array<ItemFicheDTO>> {
		const res = await http().get('/inventory/all');
		return res.data;
	},
	async useInventoryItem(itemId: number, dinozId: number): Promise<ItemFeedBack[]> {
		const res = await http().get(`/inventory/${dinozId}/${itemId}`);
		return res.data;
	},
	async equipInventoryItem(dinozId: number, itemId: number, equip: boolean): Promise<Array<DinozItems>> {
		const res = await http().put(`/inventory/${dinozId}`, { itemId: itemId, equip: equip });
		return res.data;
	}
};
