import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import { body, validationResult } from 'express-validator';
import { BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import { enterBoard, getMyMatchBoard, leaveBoard, moveOnBoard } from '../business/clanChampionshipMatchService.js';
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
GET 				/match
	Get the board of the clan live (or latest finished) match, or null
POST 				/match/enter
	Put a dinoz on the board
POST 				/match/leave
	Take a dinoz off the board
POST 				/match/move
	Move a dinoz on the board (attacks if the target cell is occupied by an enemy)
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

const dinozIdValidator = body('dinozId').isInt().toInt();

routes.get(`${commonPath}/match`, async (req: Request, res: Response) => {
	try {
		const response = await getMyMatchBoard(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/match/enter`, dinozIdValidator, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		await enterBoard(req);
		return res.sendStatus(200);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/match/leave`, dinozIdValidator, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		await leaveBoard(req);
		return res.sendStatus(200);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(
	`${commonPath}/match/move`,
	dinozIdValidator,
	body('direction').isIn(Object.values(BoardDirection)),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const response = await moveOnBoard(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
