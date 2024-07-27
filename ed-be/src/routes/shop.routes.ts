import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDinozFromDinozShop } from '../business/dinozShopService.js';
import { buyItem, getItemsFromShop } from '../business/itemShopService.js';
import { apiRoutes } from '../constants/index.js';
import { getIngredientsFromItinerantShop, sellIngredient } from '../business/itinerantShopService.js';
import sendError from '../utils/sendErrors.js';

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
		sendError(res, err);
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
			sendError(res, err);
		}
	}
);

// Get the ingredients from a shop
routes.get(
	`${commonPath}/getItinerantShop/:dinozId`,
	[param('dinozId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const listIngredients = await getIngredientsFromItinerantShop(req);
			res.status(200).send(listIngredients);
		} catch (err) {
			sendError(res, err);
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
			sendError(res, err);
		}
	}
);

// Sell an ingredient from an itinerant shop
routes.put(
	`${commonPath}/sellIngredient/:dinozId`,
	[param('dinozId').exists().toInt().isNumeric(), body('ingredients').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const ret = await sellIngredient(req);
			res.status(200).send(ret);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
