import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { startRun, exitRun, move } from '../business/dungeonService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.dungeonRoute;

// ponytail: runId-as-token — possession of the id is the capability. Bind runs
// to the authenticated player before shipping beyond the POC.

/**
 * @openapi
 * /api/v1/dungeon:
 *   post:
 *     summary: Start a dungeon run. Returns only the starting fog-of-war reveal — never the layout.
 *     tags:
 *       - Dungeon
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.post(
	`${commonPath}/:id/enter`,
	[param('id').exists().isString().notEmpty()],
	async (req: Request, res: Response) => {
		try {
			const response = await startRun(req);
			return res.status(200).send(response);
		} catch (err) {
			console.error(err);
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dungeon/{id}/exit:
 *   post:
 *     summary: Leave a dungeon run from its start or exit cell. Clears the dinoz's unavailableReason.
 *     tags:
 *       - Dungeon
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       500:
 *         description: Error
 */
routes.post(
	`${commonPath}/:id/exit`,
	[param('id').exists().isString().notEmpty()],
	async (req: Request, res: Response) => {
		try {
			const response = await exitRun(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

/**
 * @openapi
 * /api/v1/dungeon/{id}/move:
 *   post:
 *     summary: Move one cell (dx/dy) or take a stair (dl). Returns the newly revealed cells only.
 *     tags:
 *       - Dungeon
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: Dungeon run id.
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             dx:
 *               type: number
 *               description: Horizontal step (-1, 0 or 1)
 *             dy:
 *               type: number
 *               description: Vertical step (-1, 0 or 1)
 *             dl:
 *               type: number
 *               description: Level step for stairs (-1, 0 or 1)
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.post(
	`${commonPath}/:id/move`,
	[
		param('id').exists().isString().notEmpty(),
		body('dx').exists().toInt().isInt({ min: -1, max: 1 }),
		body('dy').exists().toInt().isInt({ min: -1, max: 1 }),
		body('dl').exists().toInt().isInt({ min: -1, max: 1 })
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await move(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
