import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getLearnableAndUnlockableSkills, learnSkill } from '../business/skillService.js';
import { apiRoutes } from '../constants/index.js';
import { allValuesAreNumber } from '../utils/helpers/ValidatorHelper.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.levelRoute;

routes.get(
	`${commonPath}/learnableskills/:id/:tryNumber`,
	[param('id').exists().toInt().isNumeric(), param('tryNumber').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getLearnableAndUnlockableSkills(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/learnskill/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('skillIdList')
			.exists()
			.isArray()
			.notEmpty()
			.custom(value => allValuesAreNumber(value)),
		body('tryNumber').exists().toInt().isNumeric()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await learnSkill(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
