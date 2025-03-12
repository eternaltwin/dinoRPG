import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { body, param, validationResult } from 'express-validator';
import sendError from '../utils/sendErrors.js';
import {
	createTournamentDinoz,
	getCurrentEvents,
	getCurrentTournament,
	getPlayerParticipation
} from '../business/forceBruteService.js';
import { getLearnableAndUnlockableSkills, learnSkill } from '../business/skillService.js';
import { allValuesAreNumber } from '../utils/helpers/ValidatorHelper.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.events;

routes.get(`${commonPath}/tournament/current/:id`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getCurrentTournament(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/tournament/participation`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getPlayerParticipation(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/tournament/participation`, [body('name').exists()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await createTournamentDinoz(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/FBTournament/:id/:tryNumber`,
	[param('id').exists().toInt().isNumeric(), param('tryNumber').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getLearnableAndUnlockableSkills(req, 'FBTournament');
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/FBTournament/learnskill/:id`,
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
			const response = await learnSkill(req, 'FBTournament');
			return res.status(200).send(response.toString());
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/list`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getCurrentEvents(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
