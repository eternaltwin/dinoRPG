import { ItemEffect, ItemType } from '../enums/index.js';

export interface ItemFiche {
	itemId: number;
	quantity?: number;
	maxQuantity: number;
	canBeEquipped: boolean;
	canBeUsedNow: boolean;
	itemType: ItemType;
	isRare: boolean;
	price: number;
	effect?: {
		category: ItemEffect;
		value: number;
	};
}
