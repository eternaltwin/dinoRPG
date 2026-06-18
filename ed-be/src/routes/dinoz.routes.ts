import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { GatherResult } from '@drpg/core/models/gather/gatherResult';
import { DigResponse } from '@drpg/core/returnTypes/Dinoz';
import { AssignDinozBuildResponse } from '@drpg/core/returnTypes/DinozBuild';
import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { assignBuild } from '../business/dinozBuildService.js';
import {
	betaMove,
	buyDinoz,
	changeLeaderDinoz,
	digWithDinoz,
	disband,
	followDinoz,
	frozeDinoz,
	gatherWithDinoz,
	getDinozFiche,
	getDinozSkill,
	getDinozToManage,
	getGatherGrid,
	restDinoz,
	resurrectDinoz,
	setDinozName,
	setSkillState,
	unfollowDinoz,
	unfrozeDinoz,
	updateOrders,
	useIrma
} from '../business/dinozService.js';
import { reincarnate } from '../business/skillService.js';
import { cancelConcentrate, concentrate } from '../business/specialService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { ErrorResponse } from './index.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.dinozRoute;

/**
 * @openapi
 * /api/v1/dinoz/fiche/{dinozId}:
 *   get:
 *     summary: Get the fiche of a dinoz
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to GET.
 *     responses:
 *       200:
 *         description: Returns a dinoz fiche.
 */
routes.get(
	`${commonPath}/fiche/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: DinozFiche = await getDinozFiche(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/buydinoz/{dinozId}:
 *   post:
 *     summary: Buy a dinoz in the shop
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to buy.
 *     responses:
 *       200:
 *         description: Returns a dinoz fiche.
 */
routes.post(
	`${commonPath}/buydinoz/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: DinozFiche = await buyDinoz(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/setname/{dinozId}:
 *   put:
 *     summary: Change the name of a selected dinoz
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to buy.
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - newName
 *           properties:
 *             newName:
 *               type: string
 *               description: New name of the dinoz
 *     responses:
 *       200:
 *         description: Returns a dinoz fiche.
 */
routes.put(
	`${commonPath}/setname/:id`,
	[param('id').exists().toInt().isNumeric(), body('newName').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await setDinozName(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/skill/{dinozId}:
 *   get:
 *     summary: Get all the skill of a selected dinoz
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz.
 *     responses:
 *       200:
 *         description: Array of the skills known
 */
routes.get(
	`${commonPath}/skill/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getDinozSkill(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/setskillstate/{dinozId}:
 *   put:
 *     summary: Change the state of a skill
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
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
 *             - skillId
 *             - skillState
 *           properties:
 *             skillId:
 *               type: number
 *               description: Id of the skill
 *             skillState:
 *               type: boolean
 *               description: state of the skill
 *               enum: [true, false]
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.put(
	`${commonPath}/setskillstate/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('skillId').exists().toInt().isNumeric(),
		body('skillState').exists().isBoolean()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: boolean = await setSkillState(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/betamove/{dinozId}:
 *   put:
 *     summary: Change the place of a dinoz
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
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
 *             - placeId
 *           properties:
 *             placeId:
 *               type: number
 *               description: Id of the destination
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.put(
	`${commonPath}/betamove`,
	[body('placeId').exists().toInt().isNumeric(), body('dinozId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await betaMove(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/resurrect/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const ret = await resurrectDinoz(req);
			return res.status(200).send(ret);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/dig/{dinozId}:
 *   get:
 *     summary: Dig with the dinoz
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to dig.
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           required:
 *             - placeId
 *           properties:
 *             placeId:
 *               type: number
 *               description: Id of the place where the digging happens
 *     responses:
 *       200:
 *         description: Returns a dig response (rewards and/or fight).
 */
routes.get(
	`${commonPath}/dig/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response<DigResponse | ErrorResponse>) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await digWithDinoz(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/gather/{dinozId}:
 *   get:
 *     summary: Get the gather grid of the specific place
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to gather.
 *     responses:
 *       200:
 *         description: Returns a grid.
 */
routes.get(
	`${commonPath}/gather/:id/:type`,
	[param('id').exists().toInt().isNumeric(), param('type').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getGatherGrid(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dinoz/gather/{dinozId}:
 *   put:
 *     summary: Gather with the dinoz
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dinoz
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to gather.
 *     responses:
 *       200:
 *         description: Returns a grid.
 */
routes.put(
	`${commonPath}/gather/:id`,
	[param('id').exists().toInt().isNumeric(), body('type').exists().isString(), body('box').exists().toArray()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: GatherResult = await gatherWithDinoz(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/concentrate/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await concentrate(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/noconcentrate/:id`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await cancelConcentrate(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Route for /manage view
routes.get(`${commonPath}/manage`, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getDinozToManage(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/manage`, [body('order').exists().isArray()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await updateOrders(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

// Follow
routes.post(
	`${commonPath}/:id/follow/:targetId`,
	[param('id').exists().toInt().isNumeric(), param('targetId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await followDinoz(req);
			return res.status(200).send({
				message: 'Dinoz followed'
			});
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Unfollow
routes.post(
	`${commonPath}/:id/unfollow`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await unfollowDinoz(req);
			return res.status(200).send({
				message: 'Dinoz unfollowed'
			});
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Change Leader
routes.post(
	`${commonPath}/:id/change/:targetId`,
	[param('id').exists().toInt().isNumeric(), param('targetId').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await changeLeaderDinoz(req);
			return res.status(200).send({
				message: 'Leader changed successfully'
			});
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Disband
routes.post(
	`${commonPath}/:id/disband`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await disband(req);
			return res.status(200).send({
				message: 'Dinoz unfollowed'
			});
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/irma`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const ret = await useIrma(req);
			return res.status(200).send(ret);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/froze`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await frozeDinoz(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/unfroze`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await unfrozeDinoz(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/rest`,
	[param('id').exists().toInt().isNumeric(), body('start').exists().isBoolean()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await restDinoz(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:id/reincarnate`,
	[param('id').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await reincarnate(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:id/build`,
	[param('id').exists().toInt().isNumeric(), body('buildId').optional().isString()],
	async (req: Request, res: Response<AssignDinozBuildResponse | ErrorResponse>) => {
		if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req) });
		try {
			await assignBuild(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
