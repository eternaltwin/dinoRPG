import { DinozItems } from '@drpg/core/models/item/DinozItems';
import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { equipItem, getAllItemsData, useItem } from '../business/inventoryService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.inventoryRoute;

routes.get(`${commonPath}/all`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getAllItemsData(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/:dinozId/:itemId`,
	[param('dinozId').exists().toInt().isNumeric(), param('itemId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await useItem(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:dinozId`,
	[
		param('dinozId').exists().toInt().isNumeric(),
		body('itemId').exists().toInt().isNumeric(),
		body('equip').exists().isBoolean()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: DinozItems[] = await equipItem(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
