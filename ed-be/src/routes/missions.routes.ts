import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import { endMission, getMissionsList, interactMission, updateMission } from '../business/missionsService.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { postError } from '../utils/discord.js';
import { MissionList } from '@drpg/core/models/missions/missionList';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';

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
			const response: Array<MissionList> = await getMissionsList(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

/**
 * @openapi
 * /api/v1/missions/{dinozId}/{missionId}:
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
			const response: boolean = await updateMission(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			return res.status(500).send(e.message);
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
			const response: string = await interactMission(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			return res.status(500).send(e.message);
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
			const response: Array<Rewarder> = await endMission(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			return res.status(500).send(e.message);
		}
	}
);

export default routes;
