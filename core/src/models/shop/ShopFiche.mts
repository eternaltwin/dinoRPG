import { ShopType } from "../enums/ShopType.mjs";
import { ItemFiche } from "../item/ItemFiche.mjs";

export class ShopFiche {
	shopId: number;
	placeId: number;
	type: ShopType;
	listItemsSold: Array<Partial<ItemFiche>>;
}
