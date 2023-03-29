import { Request } from 'express';
import { getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import { PlayerIngredient } from '../entity/index.js';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ingredientList } from '../constants/index.js';

/**
 * Get all the ingredients from a player
 * @param req
 * @returns Array<IngredientFiche>
 * 				An array with all ingredients that player owns
 */
const getAllIngredientsData = async (req: Request): Promise<Array<Partial<IngredientFiche>>> => {
	const allIngredientsData: Array<PlayerIngredient> = await getAllIngredientsDataRequest(req.user!.playerId!);

	const ingredients: Array<Partial<IngredientFiche>> = allIngredientsData.map(ingr => {
		const ingredientFound: [string, IngredientFiche] = Object.entries(ingredientList).find(
			([, value]) => value.ingredientId === ingr.ingredientId
		)!;

		return {
			name: ingredientFound[0].toLowerCase() as Lowercase<string>,
			quantity: ingr.quantity,
			maxQuantity: ingredientFound[1].maxQuantity
		};
	});

	return ingredients;
};

export { getAllIngredientsData };
