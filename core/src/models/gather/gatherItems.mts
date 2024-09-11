import { Condition } from '../npc/NpcConditions.mjs';

export interface GatherItems {
	type: 'ingredient' | 'item';
	ingredientId: number[];
	startQuantity: number;
	condition?: Condition;
}
