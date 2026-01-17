import { SecretData } from '@drpg/core/models/admin/SecretData';
import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
	addSecret,
	debugFight,
	editDinoz,
	editPlayer,
	getAdminDashBoard,
	getAllSecrets,
	getJobs,
	getMultiIps,
	givePlayerEpicReward,
	listAllDinozFromPlayer,
	listAllPlayerInformationForAdminDashboard, listOneDinozFromPlayer,
	listPlayerBehindIp,
	modifyPlayerIngredients,
	modifyPlayerItems,
	setPlayerMoney,
	truncateAll,
	updatePlayerQuestProgression
} from '../business/adminService.js';
import { apiRoutes } from '../constants/index.js';
import { checkIsAdmin } from '../utils/jwt.js';
import sendError from '../utils/sendErrors.js';
import {
	banPlayer,
	cancelBan,
	getAllModeration,
	getPaginatedBannedPlayers, multipleBan,
	takeActionOnReport,
	updateBan
} from '../business/moderationService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.adminRoute;

routes.get(`${commonPath}/dashboard`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response: boolean = await getAdminDashBoard(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
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
		body('nbrUpFire').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('nbrUpWood').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('nbrUpWater').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('nbrUpLightning').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('nbrUpAir').default(undefined).optional({ nullable: true }).exists().toInt().isInt(),
		body('status').default(undefined).optional({ nullable: true }).exists().isArray(),
		body('statusOperation').default(undefined).optional({ nullable: true }).exists().isString(),
		body('skills').default(undefined).optional({ nullable: true }).exists().isArray(),
		body('skillOperation').default(undefined).optional({ nullable: true }).exists().isString(),
		body('unlockableSkills').default(undefined).optional({ nullable: true }).exists().isArray(),
		body('unlockableSkillOperation').default(undefined).optional({ nullable: true }).exists().isString()
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
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/gold/:id`,
	[param('id').exists().isString(), body('operation').exists().isString(), body('gold').exists().toInt().isNumeric()],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: string = await setPlayerMoney(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/epic/:id`,
	[param('id').exists().isString(), body('operation').exists().isString(), body('epicRewardId').exists().isArray()],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await givePlayerEpicReward(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:id/items`,
	[
		param('id').exists().isString(),
		body('operation').exists().isString().isIn(['increase', 'decrease']),
		body('items')
			.isArray()
			.custom((items: Record<string, unknown>[]) => {
				return items.every(
					item => typeof item.id === 'number' && item.id > 0 && typeof item.quantity === 'number' && item.quantity > 0
				);
			})
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			await modifyPlayerItems(req);
			return res.status(200).send('Items modified successfully');
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:id/ingredients`,
	[
		param('id').exists().isString(),
		body('operation').exists().isString().isIn(['increase', 'decrease']),
		body('ingredients')
			.isArray()
			.custom((ingredients: Record<string, unknown>[]) => {
				return ingredients.every(
					ing => typeof ing.id === 'number' && ing.id > 0 && typeof ing.quantity === 'number' && ing.quantity > 0
				);
			})
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			await modifyPlayerIngredients(req);
			return res.status(200).send('Ingredients modified successfully');
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:id/quests`,
	[
		param('id').exists().isString(),
		body('operation').exists().isString().isIn(['increase', 'decrease']),
		body('quests')
			.isArray()
			.custom((quests: Record<string, unknown>[]) => {
				return quests.every(
					q =>
						q.questId &&
						typeof q.questId === 'number' &&
						q.questId > 0 &&
						q.progression &&
						typeof q.progression === 'number' &&
						q.progression > 0
				);
			})
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			await updatePlayerQuestProgression(req);
			return res.status(200).send('Progression quest modified successfuly');
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/playerdinoz/:id`,
	param('id').exists().isString(),
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await listAllDinozFromPlayer(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/dinoz/:id`,

	param('id').exists().isNumeric(),
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await listOneDinozFromPlayer(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/player/:id`,
	[
		param('id').exists().isString(),
		body('customText').default(undefined).optional().exists(),
		body('quetzuBought').default(undefined).optional().exists().isNumeric(),
		body('dailyGridRewards').default(undefined).optional().exists().isNumeric(),
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
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/playerinfo/:id`,
	param('id').exists().isString(),
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await listAllPlayerInformationForAdminDashboard(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
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
		sendError(res, err);
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
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/moderation/:page`,
	[param('page').exists().isNumeric()],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getAllModeration(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/moderation/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('action').exists().isString().isIn(['closed', 'warning', 'shortBan', 'mediumBan', 'longBan', 'infiniteBan'])
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await takeActionOnReport(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/ban/:page`,
	[param('page').exists().isNumeric()],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getPaginatedBannedPlayers(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/ban/:id`,
	[
		param('id').exists().isString(),
		body('action').exists().isString().isIn(['shortBan', 'mediumBan', 'longBan', 'infiniteBan']),
		body('reason').exists().isString().isIn(['multi', 'dinozName', 'accountName', 'avatar', 'customText']),
		body('comment').exists().isString(),
		body('dinozId').optional().toInt().isNumeric()
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await banPlayer(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/updateBan/:id`,
	[
		param('id').exists().isString(),
		body('action').optional().isString().isIn(['closed', 'warning', 'shortBan', 'mediumBan', 'longBan', 'infiniteBan']),
		body('reason').optional().isString().isIn(['multi', 'dinozName', 'accountName', 'avatar', 'customText']),
		body('comment').optional().isString(),
		body('dinozId').optional({ nullable: true }).toInt().isNumeric()
	],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await updateBan(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/cancelBan/:id`,
	[param('id').exists().isString()],
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await cancelBan(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(`${commonPath}/truncateGame`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		await truncateAll(req);
		return res.status(200).send();
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/:dinoz1/:dinoz2/:seed/:type`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const fight = await debugFight(req);
		return res.status(200).send(fight);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/jobs`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getJobs();
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/accounts/page/:page`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getMultiIps(+req.params.page);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/accounts/ip/:ip`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await listPlayerBehindIp(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.put(`${commonPath}/massban`, checkIsAdmin, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await multipleBan(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
