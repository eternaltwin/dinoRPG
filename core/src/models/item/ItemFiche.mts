import { PassiveEffects } from '../dinoz/SkillDetails.mjs';
import { SkillFightCondition } from '../dinoz/SkillFightCondition.mjs';
import { ItemType } from '../enums/ItemType.mjs';
import { ItemEffects } from './ItemEffects.mjs';
import { Item } from './ItemList.mjs';

export interface ItemFiche {
	name: string;
	itemId: Item;
	quantity?: number;
	maxQuantity: number;
	canBeEquipped: boolean;
	canBeUsedNow: boolean;
	itemType: ItemType;
	isRare: boolean;
	price: number;
	effect?: ItemEffects;
	priority?: number;
	probability?: number;
	sellable: boolean;
	display: string;
	passiveEffects?: PassiveEffects;
	fightCondition?: SkillFightCondition;
}

export interface ItemFicheDTO {
	id: number;
	price: number;
	quantity: number;
	maxQuantity: number;
}
