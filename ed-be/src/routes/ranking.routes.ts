import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { getPlayerPosition, getRanking, getStatRankings, getWarHistoryRanking } from '../business/rankingService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.rankingRoutes;

routes.get(
	`${commonPath}/:sort/:page`,
	[param('sort').exists().isString(), param('page').exists().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getRanking(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:playerId/get/position`,
	[param('playerId').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const position = await getPlayerPosition(req);
			return res.status(200).send({ position });
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/war/history/:page`,
	[param('page').isInt({ min: 1 })],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const wars = await getWarHistoryRanking(req);
			return res.status(200).send(wars);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/stats`, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const statRankings = await getStatRankings();
		return res.status(200).send(statRankings);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
