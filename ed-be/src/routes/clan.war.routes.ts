import {Request, Response, Router} from "express";
import {apiRoutes} from "../constants/index.js";
import {getAllClans} from "../business/clanService.js";
import sendError from "../utils/sendErrors.js";
import { body, param, validationResult } from 'express-validator';

const routes: Router = Router();

const commonPath = apiRoutes.clanRoutes;


routes.get(
	`${commonPath}/all/:page`,
	[param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getAllClans(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);


export default routes;
