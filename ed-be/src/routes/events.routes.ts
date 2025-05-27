import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
	createTournamentDinoz,
	fightFBTournamentOpponent,
	getCurrentEvents,
	getCurrentTournament,
	getFBTournamentOpponent,
	getPlayerParticipation,
	getTournamentFights,
	readAllFightFromEventPool
} from '../business/forceBruteService.js';
import { getLearnableAndUnlockableSkills, learnSkill } from '../business/skillService.js';
import { apiRoutes } from '../constants/index.js';
import { allValuesAreNumber } from '../utils/helpers/ValidatorHelper.js';
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.events;

routes.get(`${commonPath}/tournament/current/:id`, [param('id').exists()], async (req: Request, res: Response) => {
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

routes.get(
	`${commonPath}/tournament/:tournamentId`,
	[param('tournamentId').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getPlayerParticipation(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/tournament/participation`,
	[body('name').exists(), body('tournamentId').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await createTournamentDinoz(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

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
			return res.status(200).send(response);
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

routes.get(
	`${commonPath}/tournament/:phase/:id/:pool`,
	[param('phase').exists(), param('id').exists().isUUID(), param('pool').exists().toInt()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getTournamentFights(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.patch(
	`${commonPath}/tournament/:phase/:id/:pool`,
	[param('phase').exists(), param('id').exists().isUUID(), param('pool').exists().toInt()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await readAllFightFromEventPool(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/opponent/:dinozId`,
	[param('dinozId').exists().toInt()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getFBTournamentOpponent(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/fight/:dinozId`, [param('dinozId').exists().toInt()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await fightFBTournamentOpponent(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
