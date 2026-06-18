import { Request, Response, Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { getPantheon, getPantheonIllustration } from '../business/pantheonService.js';

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

routes.get(
	`${commonPath}/:id/illustration`,
	param('id').exists().toInt().isInt(),
	async (req: Request<{ id: string }>, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const illustration = await getPantheonIllustration(req);
			if (illustration) {
				return res.status(200).contentType('image/webp').send(Buffer.from(illustration));
			}
			return res.status(200).contentType('image/webp').send(illustration);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
