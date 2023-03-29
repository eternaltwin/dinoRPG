import { Router, Request, Response } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getDinozFromDinozShop } from '../business/dinozShopService.js';
import { getItemsFromShop, buyItem } from '../business/itemShopService.js';
import { body, param, validationResult } from 'express-validator';
import { ErrorFormator } from '../utils/errorFormator.js';
import { postError } from '../utils/discord.js';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';

const routes: Router = Router();

const commonPath: string = apiRoutes.shopRoutes;

// Get the Dinoz shop
routes.get(`${commonPath}/dinoz`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const listItems: Array<DinozShopFiche> = await getDinozFromDinozShop(req);
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
			const listItems: Array<ItemFiche> = await getItemsFromShop(req);
			res.status(200).send(listItems);
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
			await buyItem(req);
			res.status(200).send();
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

export default routes;
