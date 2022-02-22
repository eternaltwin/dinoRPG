import { ItemFiche } from '../item/ItemFiche';

export interface ShopFiche {
	shopId: number;
	placeId: number;
	listItemsSold: Array<ItemFiche>;
}
