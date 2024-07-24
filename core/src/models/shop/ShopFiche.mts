import { ShopType } from '../enums/ShopType.mjs';
import { ItemFiche } from '../item/ItemFiche.mjs';
import { Condition } from '../npc/NpcConditions.mjs';
import { IngredientFiche } from '../ingredient/IngredientFiche.mjs';

export type ShopFiche = {
	shopId: number;
	placeId: number;
	name: string;
	type: ShopType;
	listItemsSold: ItemShopFiche[];
	condition?: Condition;
};

export type ItemShopFiche = {
	id: number;
	price: number;
	type: ItemShopType;
	quantity?: number;
};

export enum ItemShopType {
	INGREDIENT,
	ITEM
}
