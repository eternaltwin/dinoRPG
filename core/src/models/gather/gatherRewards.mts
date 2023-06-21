import { ItemFiche } from '../item/ItemFiche.mjs';
import { IngredientFiche } from '../ingredient/IngredientFiche.mjs';

export interface GatherRewards {
	item: Array<ItemFiche>;
	ingredients: Array<IngredientFiche>;
}
