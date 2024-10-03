import { Request, Response, Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { bidOffer, cancelOffer, createOffer, getOfferList } from '../business/offerService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/sendErrors.js';
import { totalOffers } from '../dao/offerDao.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.offerRoutes;

// Offer list getter
routes.get(
	`${commonPath}/list/:filter`,
	[
		param('filter').exists().isString(),
		query('sellerId').optional().isInt(),
		query('bidderId').optional().isInt(),
		query('expired').optional().isBoolean()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getOfferList(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/getTotal`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await totalOffers();
		return res.status(200).send(response.toString());
	} catch (err) {
		sendError(res, err);
	}
});

// Create a new offer
routes.put(
	`${commonPath}`,
	[
		body('dinoz').optional().isInt(),
		body('total').exists().isNumeric(),
		body('ingredients').exists().isArray(),
		body('items').exists().isArray()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await createOffer(req);
			return res.status(200).send({
				message: 'Offer created'
			});
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Cancel an offer
routes.delete(`${commonPath}/:offerId`, [param('offerId').exists().isInt()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		await cancelOffer(req);
		return res.status(200).send({
			message: 'Offer canceled'
		});
	} catch (err) {
		sendError(res, err);
	}
});

// Bid on an offer
routes.post(
	`${commonPath}/:offerId/bid`,
	[param('offerId').exists().isInt(), body('value').exists().isInt()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await bidOffer(req);
			return res.status(200).send({
				message: 'Bid placed'
			});
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
