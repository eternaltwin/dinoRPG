import { ingredientList } from '../models/ingredient/ingredientList.mjs';

export const getIngredientName = (id: number) => {
	const name = Object.entries(ingredientList).find(([, value]) => value.ingredientId === id)?.[0];

	if (!name) throw new Error('Ingredient not found');

	return name.toLowerCase();
};
