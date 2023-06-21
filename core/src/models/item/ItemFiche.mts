import { ItemType } from '../enums/ItemType.mjs';
import { ItemEffect } from '../enums/ItemEffect.mjs';

export interface ItemFiche {
	name?: string;
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
