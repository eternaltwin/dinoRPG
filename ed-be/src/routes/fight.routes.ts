import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { processFight, replayFight } from '../business/fightService.js';
import { apiRoutes } from '../constants/index.js';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import sendError from '../utils/server/sendErrors.js';
import {
	getFavoriteState,
	getMyFavoriteFights,
	getMyFightArchives,
	updateFavoriteFight
} from '../business/fightArchiveService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.fightRoute;

routes.put(`${commonPath}`, [body('dinozId').exists().toInt().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: FightResult = await processFight(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/archives/mine/:page`,
	[param('page').exists().isInt({ min: 1 }).toInt()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			return res.status(200).send(await getMyFightArchives(req));
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/archives/favorites`, async (req: Request, res: Response) => {
	try {
		return res.status(200).send(await getMyFavoriteFights(req));
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/:archiveId/favorite`,
	[param('archiveId').exists().isUUID()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			return res.status(200).send(await getFavoriteState(req));
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:archiveId/favorite`,
	[param('archiveId').exists().isUUID(), body('favorite').exists().isBoolean().toBoolean()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			return res.status(200).send(await updateFavoriteFight(req));
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/:archiveId`, [param('archiveId').exists().isUUID()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await replayFight(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
