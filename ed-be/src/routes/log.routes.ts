import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { getAllLogs, getLogs, getLogsByDate } from '../business/logService.js';
import { apiRoutes } from '../constants/index.js';
import { checkRole } from '../utils/index.js';
import sendError from '../utils/sendErrors.js';
import { AdminRole } from '@drpg/prisma';

const routes: Router = Router();

const commonPath: string = apiRoutes.logRoute;

routes.get(`${commonPath}/list/all`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
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
	checkRole([AdminRole.ADMIN]),
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
	`${commonPath}/list/:type/:fromDate`,
	[param('type').exists(), param('fromDate').exists()],
	checkRole([AdminRole.ADMIN]),
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
