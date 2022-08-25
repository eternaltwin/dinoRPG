import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getAllItemsData } from '../business/inventoryService.js';
import { validationResult } from 'express-validator';
import { ItemFiche } from '../models/index.js';

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
		return res.status(500).send(err.message);
	}
});

export default routes;
