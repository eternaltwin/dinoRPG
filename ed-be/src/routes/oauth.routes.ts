import { Request, Response, Router } from 'express';
import { OAuth } from '../business/oauthService.js';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { config } from '../config/config.js';
import { prisma } from '../prisma.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.oauthRoute;

routes.post(`${commonPath}/redirect`, async (_req: Request, res: Response) => {
	try {
		const response = true;
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.put(`${commonPath}/authenticate/eternal-twin`, async (req: Request, res: Response) => {
	try {
		const response = true;
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
