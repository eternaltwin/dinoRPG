export interface IngredientFiche {
	ingredientId: number;
	maxQuantity: number;
	quantity?: number;
	name?: Lowercase<string>;
}
