import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { getCurrentChampionship } from '../business/clanChampionshipService.js';

const routes: Router = Router();

const commonPath = apiRoutes.clanChampionshipRoutes;

/*
Everything else about the championship goes through the clan socket (see clanSocketRequestService).
This one stays here because any player reads it, including from another clan's page or without a clan.

List of endpoints
GET 				/
	Get the current championship (or null)
 */

routes.get(`${commonPath}/`, async (req: Request, res: Response) => {
	try {
		const response = await getCurrentChampionship(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
