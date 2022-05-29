import { Request, Response } from 'express';
import { getAllIngredientsDataRequest } from '../dao/ingredientDao.js';
import { IngredientFiche, IngredientOwn } from '../models/index.js';
import { ingredientList } from '../constants/index.js';
import { validationResult } from 'express-validator';

/**
 * Get all the ingredients from a player
 * @param req
 * @param res
 * @returns Array<IngredientFiche>
 * 				An array with all ingredients that player owns
 */
const getAllIngredientsData = async (req: Request, res: Response): Promise<Response<Array<IngredientFiche>>> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const allIngredientsData: Array<IngredientOwn> | null = await getAllIngredientsDataRequest(req.user!.playerId!);

	if (allIngredientsData === null) {
		return res.status(500).send(`Player ${req.user!.playerId!} doesn't exist`);
	}

	const ingredients: Array<Partial<IngredientFiche>> = allIngredientsData.map(ingr => {
		const ingredientFound: [string, IngredientFiche] = Object.entries(ingredientList).find(
			([, value]) => value.ingredientId === ingr.ingredientId
		)!;

		return {
			name: ingredientFound[0].toLowerCase(),
			quantity: ingr.quantity,
			maxQuantity: ingredientFound[1].maxQuantity
		};
	});

	return res.status(200).send(ingredients);
};

export { getAllIngredientsData };
