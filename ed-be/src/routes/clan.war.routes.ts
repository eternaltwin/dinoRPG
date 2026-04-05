import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/sendErrors.js';
import { body, param, validationResult } from 'express-validator';
import { eventState } from '../business/clanWar.js';

const routes: Router = Router();

const commonPath = apiRoutes.clanWarRoutes;

/*
List of endpoints
GET 				/
	Check if an event is ongoing
PUT 				/castle
	Create or repair castle
POST 				/war
	Start a war against an opponent
DELETE 			/war
	Cancel a war against an opponent
PUT 				/dinoz/:id
	Add a dinoz in defense
DELETE 			/dinoz/:id
	Remove a dinoz from defense
PATCH 			/dinoz
	Order the defense line
PUT					/war/:id
	Attack in a war
 */

routes.get(`${commonPath}/`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await eventState();
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
