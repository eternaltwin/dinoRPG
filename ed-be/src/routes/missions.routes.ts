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
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.missionsRoutes;

/**
 * @openapi
 * /api/v1/missions/{dinozId}/{npc}:
 *   get:
 *     summary: Get the fiche of a dinoz from an NPC
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Missions
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to GET.
 *       - in: path
 *         name: npc
 *         type: string
 *         required: true
 *         description: Name of the NPC.
 *     responses:
 *       200:
 *         description: Returns an array of missions.
 */
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

/**
 * @openapi
 * /api/v1/missions/update/{dinozId}/{missionId}:
 *   put:
 *     summary: Update the status of the selected mission
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Missions
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz.
 *       - in: path
 *         name: missionId
 *         type: string
 *         required: true
 *         description: ID of the mission.
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - status
 *           properties:
 *             status:
 *               type: string
 *               description: New status of the mission
 *     responses:
 *       200:
 *         description: Returns void.
 */
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

/**
 * @openapi
 * /api/v1/missions/step/{dinozId}:
 *   put:
 *     summary: Update the status of the selected mission
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Missions
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz.
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - missionId
 *             - task
 *           properties:
 *             missionId:
 *               type: number
 *               description: ID of the mission
 *             task:
 *               type: string
 *               description: Task to do
 *     responses:
 *       200:
 *         description: Returns void.
 */
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

/**
 * @openapi
 * /api/v1/missions/step/{dinozId}:
 *   put:
 *     summary: Update the status of the selected mission
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Missions
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz.
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - missionId
 *             - task
 *           properties:
 *             missionId:
 *               type: number
 *               description: ID of the mission
 *             task:
 *               type: string
 *               description: Task to do
 *     responses:
 *       200:
 *         description: Returns void.
 */
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
