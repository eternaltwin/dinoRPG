import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
	endMission,
	getGlobalMissions,
	getMissionsList,
	interactMission,
	startFightMission,
	updateMission
} from '../business/missionsService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.missionsRoutes;

routes.get(
	`${commonPath}/:id/:npc`,
	[param('id').exists().toInt().isNumeric(), param('npc').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getMissionsList(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/update/:dinozId/:missionId`,
	[
		param('dinozId').exists().toInt().isNumeric(),
		param('missionId').exists().toInt().isNumeric(),
		body('status').exists().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await updateMission(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/step/:dinozId`,
	[
		param('dinozId').exists().toInt().isNumeric(),
		body('missionId').exists().toInt().isNumeric(),
		body('task').exists().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await interactMission(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/finish/:dinozId`,
	[param('dinozId').exists().toInt().isNumeric(), body('missionId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await endMission(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Route for /missions view
routes.get(`${commonPath}/global`, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getGlobalMissions(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

// Route for fight.
routes.put(
	`${commonPath}/fight/:dinozId`,
	[
		param('dinozId').exists().toInt().isNumeric(),
		body('missionId').exists().toInt().isNumeric(),
		body('task').exists().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await startFightMission(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
