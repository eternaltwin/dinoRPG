import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import {
	buyDemonDinoz,
	getDinozFromDemonShop,
	unsacrificeDinoz,
	sacrificeDinoz
} from '../business/demonShopService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.demonShopRoutes;

/**
 * @openapi
 * /api/v1/demon/:
 *   get:
 *     summary: Retrieve player's demon shop data
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Demon
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.get(`${commonPath}/`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const shop = await getDinozFromDemonShop(req);
		res.status(200).send(shop);
	} catch (err) {
		sendError(res, err);
	}
});

/**
 * @openapi
 * /api/v1/demon/sacrificed/:dinozId:
 *   post:
 *     summary: Sacrifice a Dinoz and get the matching amount of demon tickets
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Demon
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.post(
	`${commonPath}/sacrifice/:dinozId`,
	[param('dinozId').exists().isInt()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const tickets = await sacrificeDinoz(req);
			res.status(200).json(tickets);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/demon/unsacrifice/:dinozId:
 *   post:
 *     summary: Unsacrifice a Dinoz provided the player has enough tickets.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Demon
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.post(
	`${commonPath}/unsacrifice/:dinozId`,
	[param('dinozId').exists().isInt()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await unsacrificeDinoz(req);
			res.sendStatus(200);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/demon/buy/:dinozId:
 *   post:
 *     summary: Buy a Dinoz from the demon shop
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Demon
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.post(`${commonPath}/buy/:id`, [param('id').exists().isInt()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const dinoz = await buyDemonDinoz(req);
		res.status(200).send(dinoz);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
