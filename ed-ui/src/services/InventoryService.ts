import { http } from '@/utils';
import { Item } from '@/models';

// For Player's inventory

export const InventoryService = {
	buyItem(id: number): Promise<Item> {
		return http()
			.post(`/inventory/buyitem/${id}`)
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	},

	getAllItemsData(): Promise<Array<Item>> {
		return http()
			.get('/inventory/all')
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	}
};
