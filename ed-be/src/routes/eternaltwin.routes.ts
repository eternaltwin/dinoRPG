import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import { checkPlayerLB } from '../business/eternaltwinService.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.eternalTwinRoute;

/**
 * @openapi
 * /api/v1/eternaltwin/{uuid}:
 *   get:
 *     summary: Check if the player is eligible to LB rewards
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Eternaltwin
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: uuid
 *         type: string
 *         required: true
 *         description: ET uuid of the player
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(`${commonPath}/:uuid`, [param('uuid').exists().isString()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await checkPlayerLB(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
