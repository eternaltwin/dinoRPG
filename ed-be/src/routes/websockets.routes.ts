import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { authenticate } from '../business/webSocketService.js';
import { body, header, validationResult } from 'express-validator';
import { WsChannel } from '@drpg/core/models/webSocket/WsChannel';
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.webSocketRoute;

routes.post(
	`${commonPath}/authenticate`,
	[header('user-agent').exists(), body('channel').exists().isIn(Object.values(WsChannel))],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const ticket = await authenticate(req);
			return res.status(200).send(ticket);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
