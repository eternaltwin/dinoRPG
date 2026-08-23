import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
	acceptTos,
	canCreateClan,
	getAccountData,
	getCommonData,
	getDinozList,
	playerToolTip,
	resetAccount,
	searchPlayers,
	setCustomText,
	updatePlayerSettings
} from '../business/playerService.js';
import { apiRoutes } from '../constants/index.js';
import { auth, getPlayerMoney, updatePlayerLanguage } from '../dao/playerDao.js';
import { checkLB } from '../business/eternaltwinService.js';
import sendError from '../utils/server/sendErrors.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Lang } from '@drpg/prisma';

const routes: Router = Router();

const commonPath: string = apiRoutes.playerRoute;

routes.get(`${commonPath}/commondata`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getCommonData(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/dinozList`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getDinozList(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/getmoney`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const authed = await auth(req);
		const response = await getPlayerMoney(authed.id);

		if (!response) {
			throw new ExpectedError('No player found');
		}

		return res.status(200).send(response.money.toString());
	} catch (err) {
		sendError(res, err);
	}
});

routes.patch(`${commonPath}/tos`, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		await acceptTos(req);
		return res.status(200).send();
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/canCreateClan`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await canCreateClan(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

// Import are not available
/*routes.put(
	`${commonPath}/importAPI`,
	[
		body('code').exists().notEmpty().isString(),
		body('server').exists().notEmpty().isString(),
		body('cookie').exists().notEmpty().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await importAPI(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err)
		}
	}
);

routes.put(
	`${commonPath}/importTwinoid`,
	[body('code').exists().notEmpty().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await importTwinoidData(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err)
		}
	}
);*/

routes.put(`${commonPath}/customText`, [body('message').exists()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		await setCustomText(req);
		return res.status(200).send();
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/search/:search`,
	[param('search').exists().isString().isLength({ min: 3 })],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await searchPlayers(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/labrute`, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await checkLB(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/smallMenu/:id`, [param('id').exists().isString()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await playerToolTip(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/:id`, [param('id').exists().isUUID()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getAccountData(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.delete(commonPath, [], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await resetAccount(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.put(
	`${commonPath}/language`,
	[body('language').exists().isIn(Object.values(Lang))],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const authed = await auth(req);
			const { language } = req.body;
			const response = await updatePlayerLanguage(authed.id, language);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.patch(`${commonPath}/settings/:setting`, [param('setting').exists()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	try {
		const response = await updatePlayerSettings(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
