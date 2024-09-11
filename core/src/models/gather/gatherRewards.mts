import { ItemFicheDTO } from '../item/ItemFiche.mjs';
import { IngredientFiche } from '../ingredient/IngredientFiche.mjs';

export interface GatherRewards {
	item: ItemFicheDTO[];
	ingredients: IngredientFiche[];
}
