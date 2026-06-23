import { Condition } from '../npc/NpcConditions.mjs';

export interface GatherItems {
	type: 'ingredient' | 'item';
	ingredientOrItemId: number[];
	startQuantity: number;
	condition?: Condition;
}
