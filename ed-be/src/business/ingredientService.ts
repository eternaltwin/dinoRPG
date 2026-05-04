import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { Request } from 'express';
import { getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { auth } from '../dao/playerDao.js';

/**
 * Get all the ingredients from a player
 * @param req
 * @returns Array<IngredientFiche>
 * 				An array with all ingredients that player owns
 */
export async function getAllIngredientsData(req: Request) {
	const authed = await auth(req);
	const player = await getAllIngredientsDataRequest(authed.id);

	if (!player) {
		throw new ExpectedError(`playerNotFound`);
	}

	const ingredients = player.ingredients.map(ingr => {
		const ingredientFound = Object.values(ingredientList).find(value => value.ingredientId === ingr.ingredientId);

		if (!ingredientFound) throw new ExpectedError('Ingredient not found');

		return {
			ingredientId: ingredientFound.ingredientId,
			name: ingredientFound.name.toLowerCase(),
			quantity: ingr.quantity,
			maxQuantity: player.shopKeeper ? Math.round(ingredientFound.maxQuantity * 1.5) : ingredientFound.quantity
		};
	});

	return ingredients;
}
