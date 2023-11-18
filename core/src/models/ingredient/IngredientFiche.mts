export interface IngredientFiche {
	ingredientId: number;
	maxQuantity: number;
	price: number;
	quantity?: number;
	name?: Lowercase<string>;
}
