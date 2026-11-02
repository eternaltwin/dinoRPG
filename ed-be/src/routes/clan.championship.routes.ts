import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { validationResult } from 'express-validator';
import { getCurrentChampionship, registerClan, unregisterClan } from '../business/clanChampionshipService.js';

const routes: Router = Router();

const commonPath = apiRoutes.clanChampionshipRoutes;

/*
List of endpoints
GET 				/
	Get the current championship (or null)
POST 				/registration
	Register the clan to the championship
DELETE 			/registration
	Unregister the clan from the championship
 */

routes.get(`${commonPath}/`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getCurrentChampionship(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/registration`, async (req: Request, res: Response) => {
	try {
		await registerClan(req);
		return res.sendStatus(200);
	} catch (err) {
		sendError(res, err);
	}
});

routes.delete(`${commonPath}/registration`, async (req: Request, res: Response) => {
	try {
		await unregisterClan(req);
		return res.sendStatus(200);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
