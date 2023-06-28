import { ItemType } from '../enums/ItemType.mjs';
import { ItemEffects } from './ItemEffects.mjs';

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
	effect?: ItemEffects;
}
