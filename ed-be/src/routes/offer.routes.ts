import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getGlobalMissions } from '../business/missionsService.js';
import { apiRoutes } from '../constants/index.js';
import { postError } from '../utils/discord.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { createOffer, getOfferList } from '../business/offerService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.offerRoutes;

// Route for the list tab
routes.get(
	`${commonPath}/list/:filter`,
	[param('filter').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getOfferList(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(500).send(e.message);
		}
	}
);

// Create a new offer
routes.put(
	`${commonPath}`,
	[
		body('dinoz').optional().isInt(),
		body('total').exists().isNumeric(),
		body('ingredients').exists().isArray(),
		body('items').exists().isArray(),
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await createOffer(req);
			return res.status(200).send({
				message: 'Offer created',
			});
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(500).send(e.message);
		}
	}
);

export default routes;
