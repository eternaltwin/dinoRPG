import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import {
	buyDemonDinoz,
	getDinozFromDemonShop,
	getSacrificedDinoz,
	unsacrificeDinoz,
	sacrificeDinoz
} from '../business/demonShopService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.demonShopRoutes;

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

routes.get(
	`${commonPath}/sacrificed/:page`,
	[param('page').exists().isInt({ min: 1 })],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const sacrificed = await getSacrificedDinoz(req);
			res.status(200).send(sacrificed);
		} catch (err) {
			sendError(res, err);
		}
	}
);

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
