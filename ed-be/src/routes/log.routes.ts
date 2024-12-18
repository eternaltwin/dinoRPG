import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { getLogs, getAllLogs, getLogsByDate } from '../business/logService.js';
import { apiRoutes } from '../constants/index.js';
import { LogListResponse } from '@drpg/core/returnTypes/Log';
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.logRoute;

routes.get(`${commonPath}/list/all`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const logs = await getAllLogs();
		return res.status(200).send(logs);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/list/:page/:type/:playerId/:dinozId`,
	[param('type').exists(), param('playerId').exists(), param('dinozId').exists(), param('page').isInt({ min: 1 })],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const logs = await getLogs(req);
			return res.status(200).send(logs);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/list/:type/:fromDate/:toDate`,
	[param('type').exists(), param('fromDate').exists(), param('toDate').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const logs = await getLogsByDate(req);
			return res.status(200).send(logs);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
