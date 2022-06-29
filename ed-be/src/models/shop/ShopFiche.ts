import { ShopType, ItemFiche } from '../index.js';

export interface ShopFiche {
	shopId: number;
	placeId: number;
	type: ShopType;
	listItemsSold: Array<Partial<ItemFiche>>;
}
