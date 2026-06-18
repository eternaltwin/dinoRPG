import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { getPlayerToReport, reportPlayer, reportClan } from '../business/moderationService.js';
import { param, validationResult, body } from 'express-validator';
import { ModerationReason } from '@drpg/prisma';

const routes: Router = Router();

const commonPath: string = apiRoutes.moderation;

routes.get(`${commonPath}/player/:id`, [param('id').exists().isString()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getPlayerToReport(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(
	`${commonPath}/player/:id`,
	[
		param('id').exists().isString(),
		body('reason').exists().isString(),
		body('comment').exists().isString(),
		body('dinozId').optional().isNumeric()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await reportPlayer(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/clan/:id`,
	[param('id').exists().isNumeric(), body('reason').exists().isString(), body('comment').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await reportClan(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
