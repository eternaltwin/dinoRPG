import { IngredientFiche } from '../../models/index.js';
import { PlayerIngredient } from '../../entity/index.js';

export const allIngredientData = [
	{
		ingredientId: 5,
		quantity: 5
	}
] as Array<PlayerIngredient>;

export const ingredientResponse: Array<Partial<IngredientFiche>> = [
	{
		name: 'super_poisson',
		quantity: 5,
		maxQuantity: 6
	}
];
