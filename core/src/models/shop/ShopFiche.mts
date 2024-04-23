import { ShopType } from '../enums/ShopType.mjs';
import { ItemFiche } from '../item/ItemFiche.mjs';
import { Condition } from '../npc/NpcConditions.mjs';
import { IngredientFiche } from '../ingredient/IngredientFiche.mjs';

export type ShopFiche =
	| {
			shopId: number;
			placeId: number;
			type: ShopType.ITINERANT;
			listItemsSold: Partial<IngredientFiche>[];
			condition?: Condition;
	  }
	| {
			shopId: number;
			placeId: number;
			type: Exclude<ShopType, ShopType.ITINERANT>;
			listItemsSold: Partial<ItemFiche>[];
			condition?: Condition;
	  };
