import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDinozFromDinozShop } from '../business/dinozShopService.js';
import { buyItem, getItemsFromShop } from '../business/itemShopService.js';
import { apiRoutes } from '../constants/index.js';
import { postError } from '../utils/discord.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getIngredientsFromItinerantShop, sellIngredient } from '../business/itinerantShopService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.shopRoutes;

// Get the Dinoz shop
routes.get(`${commonPath}/dinoz`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const listItems = await getDinozFromDinozShop(req);
		res.status(200).send(listItems);
	} catch (err) {
		const e = err as ErrorFormator;
		await postError(e, res);
		res.status(e.errorCode).send(e.message);
	}
});

// Get the items from a shop
routes.get(
	`${commonPath}/getShop/:shopId`,
	[param('shopId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const listItems = await getItemsFromShop(req);
			res.status(200).send(listItems);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

// Get the ingredients from a shop
routes.get(
	`${commonPath}/getItinerantShop/:itinerantId`,
	[param('itinerantId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const listIngredients = await getIngredientsFromItinerantShop(req);
			res.status(200).send(listIngredients);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

// Buy an item from a shop
routes.put(
	`${commonPath}/buyItem/:shopId`,
	[
		param('shopId').exists().toInt().isNumeric(),
		body('itemId').exists().toInt().isNumeric(),
		body('quantity').exists().toInt().isNumeric()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const ret = await buyItem(req);
			res.status(200).send(ret);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

// Sell an ingredient from an itinerant shop
routes.put(
	`${commonPath}/sellIngredient/:itinerantId`,
	[
		param('itinerantId').exists().toInt().isNumeric(),
		body('ingredientId').exists().toInt().isNumeric(),
		body('quantity').exists().toInt().isNumeric()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const ret = await sellIngredient(req);
			res.status(200).send(ret);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

export default routes;
