import { param, validationResult } from 'express-validator';
import { getRanking } from '../business/rankingService.js';
import { apiRoutes } from '../constants/index.js';
import { Request, Response, Router } from 'express';
import { PlayerRanking } from '../models/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { postError } from '../utils/discord.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.rankingRoutes;

/**
 * @openapi
 * /api/v1/ranking/{sort}/{page}:
 *   get:
 *     summary: Get a batch of ranking
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Ranking
 *       - Player
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: sort
 *         type: string
 *         required: true
 *         description: Type of the ranking to display
 *       - in: path
 *         name: page
 *         type: string
 *         required: true
 *         description: Number of  the page to display
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.get(
	`${commonPath}/:sort/:page`,
	[param('sort').exists().isString(), param('page').exists().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: Array<PlayerRanking> = await getRanking(req);
			return res.status(200).send(response);
		} catch (err) {
			console.error(err.message);
			const e: ErrorFormator = err;
			await postError(e, res);
			res.status(e.errorCode).send(e.message);
		}
	}
);

export default routes;
