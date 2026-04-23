import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/sendErrors.js';
import { body, param, validationResult } from 'express-validator';
import {
	addDefender,
	attackCastle,
	buildClanCastle,
	castleStatus,
	declareWar,
	eventState,
	forfeitWar,
	removeDefender,
	updateDefenseOrder,
	warStatus
} from '../business/clanWar.js';

const routes: Router = Router();

const commonPath = apiRoutes.clanWarRoutes;

/*
List of endpoints
GET 				/
	Check if an event is ongoing
PUT 				/castle
	Create or repair castle
GET 				/castle
	Status of the castle for clan member
GET 				/:clanId
	Get war status of a clan
POST 				/:clanId
	Start a war against an opponent
DELETE 			/:clanId
	Cancel a war against an opponent
PUT 				/dinoz/:id
	Add a dinoz in defense
DELETE 			/dinoz/:id
	Remove a dinoz from defense
PATCH 			/dinoz
	Order the defense line
PUT					/attack/:dinozId
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

routes.put(`${commonPath}/castle`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await buildClanCastle(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/castle`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await castleStatus(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/:clanId`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await warStatus(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/:clanId`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await declareWar(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.delete(`${commonPath}/:warId`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await forfeitWar(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.put(`${commonPath}/dinoz/:dinozId`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await addDefender(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.delete(`${commonPath}/dinoz/:dinozId`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await removeDefender(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.patch(`${commonPath}/dinoz`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await updateDefenseOrder(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.put(`${commonPath}/attack/:dinozId`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await attackCastle(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
