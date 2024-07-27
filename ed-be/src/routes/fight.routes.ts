import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { processFight } from '../business/fightService.js';
import { apiRoutes } from '../constants/index.js';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.fightRoute;

/**
 * @openapi
 * /api/v1/fight:
 *   get:
 *     summary: Process a fight
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fight
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: dinozId
 *         type: string
 *         required: true
 *         description: Numeric ID of the dinoz to that launches the fight
 *     responses:
 *       200:
 *         description: Returns the result of the fight
 */
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

export default routes;
