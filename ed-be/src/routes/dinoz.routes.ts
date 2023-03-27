import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
	getDinozFiche,
	buyDinoz,
	setDinozName,
	getDinozSkill,
	setSkillState,
	betaMove,
	resurrectDinoz,
	digWithDinoz
} from '../business/dinozService.js';
import { apiRoutes, regex } from '../constants/index.js';
import { DinozFiche, DinozSkillFiche, FightResult } from '../models/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { postError } from '../utils/discord.js';

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
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
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
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
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
	[param('id').exists().toInt().isNumeric(), body('newName').exists().isString().matches(regex.DINOZ_NAME)],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await setDinozName(req);
			return res.status(200).send();
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
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
			const response: Array<DinozSkillFiche> = await getDinozSkill(req);
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
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
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
			const response: FightResult = await betaMove(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
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
			const response: void = await resurrectDinoz(req);
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
 *     responses:
 *       200:
 *         description: Returns an item.
 */
routes.get(`${commonPath}/dig/:id`, [param('id').exists().toInt().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await digWithDinoz(req);
		return res.status(200).send(response);
	} catch (err) {
		const e = err as ErrorFormator;
		console.error(e.message);
		await postError(e, res);
		res.status(e.errorCode).send(e.message);
	}
});

export default routes;
