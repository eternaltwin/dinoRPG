import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getAllIngredientsData } from '../business/ingredientService.js';
import { validationResult } from 'express-validator';
import { IngredientFiche } from '../models/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { postError } from '../utils/discord.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.ingredientRoute;

/**
 * @openapi
 * /api/v1/ingredients/all:
 *   get:
 *     summary: Retrieve all ingredient from the player
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Ingredients
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.get(`${commonPath}/all`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: Array<Partial<IngredientFiche>> = await getAllIngredientsData(req);
		return res.status(200).send(response);
	} catch (err) {
		console.error(err.message);
		const e: ErrorFormator = err;
		await postError(e, res);
		res.status(e.errorCode).send(e.message);
	}
});

export default routes;
