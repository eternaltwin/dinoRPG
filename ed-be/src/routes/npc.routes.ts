import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getNpcSpeech } from '../business/npcService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.npcRoute;

routes.put(
	`${commonPath}/:dinozId/:npc`,
	[
		param('npc').exists().isString(),
		param('dinozId').exists().toInt().isNumeric(),
		body('step').optional({ nullable: true }).exists().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const dialogue = await getNpcSpeech(req);
			res.status(200).send(dialogue);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
