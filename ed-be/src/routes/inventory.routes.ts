import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getAllItemsData, useItem } from '../business/inventoryService.js';
import { param, validationResult } from 'express-validator';
import { ItemFiche } from '../models/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { postError } from '../utils/discord.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.inventoryRoute;

/**
 * @openapi
 * /api/v1/inventory/all:
 *   get:
 *     summary: Retrieve player's inventory
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Inventory
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
		const response: Array<ItemFiche> = await getAllItemsData(req);
		return res.status(200).send(response);
	} catch (err) {
		console.error(err.message);
		const e: ErrorFormator = err;
		await postError(e, res);
		res.status(e.errorCode).send(e.message);
	}
});

/**
 * @openapi
 * /api/v1/inventory/{dinozId}/{itemId}:
 *   get:
 *     summary: Use the item on the dinoz
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Level
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz.
 *       - in: path
 *         name: itemId
 *         type: string
 *         required: true
 *         description: Numeric ID of the item.
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(
	`${commonPath}/:dinozId/:itemId`,
	[param('dinozId').exists().toInt().isNumeric(), param('itemId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: void = await useItem(req);
			return res.status(200).send(response);
		} catch (err) {
			const e: ErrorFormator = err;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

export default routes;
