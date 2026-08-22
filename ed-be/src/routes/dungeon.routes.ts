import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { startRun, exitRun, move } from '../business/dungeonService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.dungeonRoute;

// ponytail: runId-as-token — possession of the id is the capability. Bind runs
// to the authenticated player before shipping beyond the POC.

routes.post(
	`${commonPath}/:id/enter`,
	[param('id').exists().isString().notEmpty()],
	async (_req: Request, res: Response) => {
		try {
			const response = await startRun(_req);
			return res.status(200).send(response);
		} catch (err) {
			console.error(err);
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/exit`,
	[param('id').exists().isString().notEmpty()],
	async (req: Request, res: Response) => {
		try {
			const response = await exitRun(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/move`,
	[
		param('id').exists().isString().notEmpty(),
		body('dx').exists().toInt().isInt({ min: -1, max: 1 }),
		body('dy').exists().toInt().isInt({ min: -1, max: 1 }),
		body('dl').exists().toInt().isInt({ min: -1, max: 1 })
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await move(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
