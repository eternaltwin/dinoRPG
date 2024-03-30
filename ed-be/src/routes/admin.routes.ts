import { SecretData } from '@drpg/core/models/admin/SecretData';
import { PlayerTypeToSend } from '@drpg/core/models/player/PlayerTypeToSend';
import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
	addSecret,
	editDinoz,
	editPlayer,
	getAdminDashBoard,
	getAllSecrets,
	givePlayerEpicReward,
	listAllDinozFromPlayer,
	listAllPlayerInformationForAdminDashboard,
	setPlayerMoney
} from '../business/adminService.js';
import { apiRoutes } from '../constants/index.js';
import { postError } from '../utils/discord.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { checkIsAdmin } from '../utils/jwt.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.adminRoute;

routes.get(`${commonPath}/dashboard`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: boolean = await getAdminDashBoard();
		return res.status(200).send(response);
	} catch (err) {
		const e = err as ErrorFormator;
		console.error(e.message);
		return res.status(e.errorCode || 500).send(e.message);
	}
});

routes.put(
	`${commonPath}/dinoz/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('name').default(undefined).optional({ nullable: true }).exists().isString(),
		body('unavailableReason').default(undefined).optional({ nullable: true }).exists().isString(),
		body('level').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('placeId').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('canChangeName').default(undefined).optional({ nullable: true }).exists().toBoolean(),
		body('life').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('maxLife').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('experience').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('status').default(undefined).optional({ nullable: true }).exists().isArray(),
		body('statusOperation').default(undefined).optional({ nullable: true }).exists().isString(),
		body('skill').default(undefined).optional({ nullable: true }).exists().isArray(),
		body('skillOperation').default(undefined).optional({ nullable: true }).exists().isString()
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await editDinoz(req);
			return res.status(200).send();
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

routes.put(
	`${commonPath}/gold/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('operation').exists().isString(),
		body('gold').exists().toInt().isNumeric()
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: string = await setPlayerMoney(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

routes.put(
	`${commonPath}/epic/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('operation').exists().isString(),
		body('epicRewardId').exists().isArray()
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await givePlayerEpicReward(req);
			return res.status(200).send();
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

routes.get(
	`${commonPath}/playerdinoz/:id`,
	param('id').exists().toInt().isNumeric(),
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await listAllDinozFromPlayer(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

routes.put(
	`${commonPath}/player/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('hasImported').default(undefined).optional().exists().toBoolean(),
		body('customText').default(undefined).optional().exists(),
		body('quetzuBought').default(undefined).optional().exists().isNumeric(),
		body('leader').default(undefined).optional().exists().toBoolean(),
		body('engineer').default(undefined).optional().exists().toBoolean(),
		body('cooker').default(undefined).optional().exists().toBoolean(),
		body('shopKeeper').default(undefined).optional().exists().toBoolean(),
		body('merchant').default(undefined).optional().exists().toBoolean(),
		body('priest').default(undefined).optional().exists().toBoolean(),
		body('teacher').default(undefined).optional().exists().toBoolean(),
		body('messie').default(undefined).optional().exists().toBoolean(),
		body('matelasseur').default(undefined).optional().exists().toBoolean()
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await editPlayer(req);
			return res.status(200).send();
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

routes.get(
	`${commonPath}/playerinfo/:id`,
	param('id').exists().toInt().isNumeric(),
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: Partial<PlayerTypeToSend> = await listAllPlayerInformationForAdminDashboard(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

routes.get(`${commonPath}/secret/all`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: SecretData[] = await getAllSecrets();
		return res.status(200).send(response);
	} catch (err) {
		const e = err as ErrorFormator;
		await postError(e, res);
		res.status(e.errorCode || 500).send(e.message);
	}
});

routes.put(
	`${commonPath}/secret/add`,
	[body('key').exists().isString(), body('value').exists().isString()],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: SecretData[] = await addSecret(req);
			return res.status(200).send(response);
		} catch (err) {
			const e = err as ErrorFormator;
			await postError(e, res);
			res.status(e.errorCode || 500).send(e.message);
		}
	}
);

export default routes;
