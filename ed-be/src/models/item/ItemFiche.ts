import { ItemType } from '../../models/index.js';

export interface ItemFiche {
	itemId: number;
	quantity?: number;
	maxQuantity: number;
	canBeEquipped: boolean;
	canBeUsedNow: boolean;
	itemType: ItemType;
	isRare: boolean;
	price: number;
}
