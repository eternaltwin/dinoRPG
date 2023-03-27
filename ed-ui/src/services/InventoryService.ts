import { http } from '../utils';
import { Item } from '../models';

// For Player's inventory

export const InventoryService = {
	getAllItemsData(): Promise<Array<Item>> {
		return http()
			.get('/inventory/all')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},

	useInventoryItem(itemId: number, dinozId: number): Promise<void> {
		return http()
			.get(`/inventory/${dinozId}/${itemId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
