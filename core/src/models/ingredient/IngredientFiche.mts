import { Ingredient } from "./ingredientList.mjs";
export interface IngredientFiche {
	name?: string;
	ingredientId: Ingredient;
	maxQuantity: number;
	price: number;
	quantity?: number;
}
