import { Request, Response, Router } from 'express';
import { param, body, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { createThread, getAllThreadsFromPage, getThread } from '../business/forumService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.forum;

/**
 * @openapi
 * /api/v1/forum:
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
routes.get(`${commonPath}/:page`, [param('page').exists().toInt().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getAllThreadsFromPage(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/:threadId/:page`,
	[param('threadId').exists(), param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getThread(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/newThread`,
	[body('title').exists(), body('message').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await createThread(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
