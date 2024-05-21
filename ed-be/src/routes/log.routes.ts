import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { getLogs, getAllLogs, getLogsByDate } from '../business/logService.js';
import { apiRoutes } from '../constants/index.js';
import { postError } from '../utils/discord.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { LogListResponse } from '@drpg/core/returnTypes/Log';

const routes: Router = Router();

const commonPath: string = apiRoutes.logRoute;

routes.get(`${commonPath}/list/all`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const logs: LogListResponse = await getAllLogs();
		return res.status(200).send(logs);
	} catch (err) {
		const e = err as ErrorFormator;
		await postError(e, res);
		res.status(e.errorCode || 500).send(e.message);
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
			const logs: LogListResponse = await getLogs(req);
			return res.status(200).send(logs);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
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
			const logs: LogListResponse = await getLogsByDate(req);
			return res.status(200).send(logs);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

export default routes;
