import { IngredientFiche, IngredientOwn } from '../../models/index.js';

export const allIngredientData = [
	{
		ingredientId: 5,
		quantity: 5
	}
] as Array<IngredientOwn>;

export const ingredientResponse: Array<Partial<IngredientFiche>> = [
	{
		name: 'super_poisson',
		quantity: 5,
		maxQuantity: 6
	}
];
