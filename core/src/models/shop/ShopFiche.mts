import { ShopType } from '../enums/ShopType.mjs';
import { ItemFiche } from '../item/ItemFiche.mjs';
import { Condition } from '../npc/NpcConditions.mjs';

export interface ShopFiche {
	shopId: number;
	placeId: number;
	type: ShopType;
	listItemsSold: Partial<ItemFiche>[];
	condition?: Condition
}
