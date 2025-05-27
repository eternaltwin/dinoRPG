import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getLearnableAndUnlockableSkills, learnSkill } from '../business/skillService.js';
import { apiRoutes } from '../constants/index.js';
import { allValuesAreNumber } from '../utils/helpers/ValidatorHelper.js';
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.levelRoute;

/**
 * @openapi
 * /api/v1/level/learnableskills/{dinozId}/{tryNumber}:
 *   get:
 *     summary: Get the available skill for level up
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Level
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz.
 *       - in: path
 *         name: tryNumber
 *         type: string
 *         required: true
 *         description: Number of the try
 *         enum: [1, 2]
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(
	`${commonPath}/learnableskills/:id/:tryNumber`,
	[param('id').exists().toInt().isNumeric(), param('tryNumber').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getLearnableAndUnlockableSkills(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/level/learnskill/{dinozId}:
 *   post:
 *     summary: Learn a specified skill
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Level
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
 *             - skillIdList
 *             - tryNumber
 *           properties:
 *             skillIdList:
 *               type: Array<number>
 *               description: Array of the skill learned or unlocked
 *             tryNumber:
 *               type: number
 *               description: Number of the attempt
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.post(
	`${commonPath}/learnskill/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('skillIdList')
			.exists()
			.isArray()
			.notEmpty()
			.custom(value => allValuesAreNumber(value)),
		body('tryNumber').exists().toInt().isNumeric()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await learnSkill(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
