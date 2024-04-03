import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { Request } from 'express';
import { getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * Get all the ingredients from a player
 * @param req
 * @returns Array<IngredientFiche>
 * 				An array with all ingredients that player owns
 */
export async function getAllIngredientsData(req: Request) {
	if (!req.auth?.playerId) throw new ErrorFormator(500, 'No auth data');
	const allIngredientsData = await getAllIngredientsDataRequest(req.auth.playerId);

	const ingredients = allIngredientsData.map(ingr => {
		const ingredientFound = Object.entries(ingredientList).find(
			([, value]) => value.ingredientId === ingr.ingredientId
		);

		if (!ingredientFound) throw new ErrorFormator(500, 'Ingredient not found');

		return {
			ingredientId: ingr.ingredientId,
			name: ingredientFound[0].toLowerCase() as Lowercase<string>,
			quantity: ingr.quantity,
			maxQuantity: ingredientFound[1].maxQuantity
		};
	});

	return ingredients;
}
