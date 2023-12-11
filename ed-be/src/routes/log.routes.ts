import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { getLogs } from '../business/logService.js';
import { apiRoutes } from '../constants/index.js';
import { postError } from '../utils/discord.js';
import { ErrorFormator } from '../utils/errorFormator.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.logRoute;


routes.get(
	`${commonPath}/list/:type/:playerId/:dinozId`,
	[
		param('type').isString(),
		param('playerId').isNumeric().optional(),
		param('dinozId').isNumeric().optional()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const logs = await getLogs(req);
			return res.status(200).send(logs);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

export default routes;
