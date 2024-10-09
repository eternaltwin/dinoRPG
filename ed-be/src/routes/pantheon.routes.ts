import { Request, Response, Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/sendErrors.js';
import { getPantheon } from '../business/pantheonService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.pantheon;

routes.get(
	`${commonPath}/:type`,
	[
		param('type').exists().isString(),
		query('level').optional().isInt(),
		query('raceId').optional().isInt(),
		query('rewardId').optional().isInt()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getPantheon(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
