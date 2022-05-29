import { IngredientOwn } from '../models/index.js';

const getAllIngredientsDataRequest = (playerId: number): Promise<Array<IngredientOwn> | null> => {
	return IngredientOwn.findAll({
		attributes: ['ingredientId', 'quantity'],
		where: { playerId: playerId },
		order: ['ingredientId']
	});
};

export { getAllIngredientsDataRequest };
