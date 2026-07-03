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
	getOngoingEvent,
	createSeededDungeon,
	listDungeons,
	givePlayerEpicReward,
	getPlayerData,
	getDinozDataFromPlayer,
	listPlayerBehindIp,
	modifyPlayerIngredients,
	modifyPlayerItems,
	setPlayerMoney,
	startClanWarEvent,
	truncateAll,
	updatePlayerQuestProgression,
	getClanDetailsAdmin,
	searchClansAdmin,
	updateClanNameAdmin,
	updateClanLanguagesAdmin,
	setClanLeaderAdmin,
	kickClanMemberAdmin,
	deleteClanAdmin,
	removeClanBannerAdmin,
	updateClanTreasureGold,
	updateClanTreasureIngredients,
	runJob
} from '../business/adminService.js';
import { apiRoutes } from '../constants/index.js';
import { checkRole } from '../utils/server/jwt.js';
import sendError from '../utils/server/sendErrors.js';
import {
	banPlayer,
	cancelBan,
	getAllModeration,
	getPaginatedBannedPlayers,
	multipleBan,
	takeActionOnReport,
	updateBan
} from '../business/moderationService.js';
import { AdminRole, LogType } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { auth } from '../dao/playerDao.js';
import { createLog } from '../dao/logDao.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.adminRoute;

routes.get(
	`${commonPath}/dashboard`,
	checkRole([AdminRole.ADMIN, AdminRole.AMPHI]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response: boolean = await getAdminDashBoard(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
	`${commonPath}/dinoz/:id`,

	param('id').exists().isNumeric(),
	checkRole([AdminRole.ADMIN]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getDinozDataFromPlayer(req);
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getPlayerData(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/secret/all`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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
		body('reason').exists().isString().isIn(['multi', 'dinozName', 'accountName', 'avatar', 'customText', 'other']),
		body('comment').exists().isString(),
		body('dinozId').optional().toInt().isNumeric()
	],
	checkRole([AdminRole.ADMIN]),
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
		body('reason').optional().isString().isIn(['multi', 'dinozName', 'accountName', 'avatar', 'customText', 'other']),
		body('comment').optional().isString(),
		body('dinozId').optional({ nullable: true }).toInt().isNumeric()
	],
	checkRole([AdminRole.ADMIN]),
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
	checkRole([AdminRole.ADMIN]),
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

routes.delete(`${commonPath}/truncateGame`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
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

routes.get(
	`${commonPath}/:dinoz1/:dinoz2/:seed/:type`,
	checkRole([AdminRole.ADMIN]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const fight = await debugFight(req);
			return res.status(200).send(fight);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/jobs`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
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

routes.patch(`${commonPath}/jobs/:jobId`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await runJob(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/accounts/page/:page`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
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

routes.get(`${commonPath}/accounts/ip/:ip`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
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

routes.put(`${commonPath}/massban`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
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

routes.get(
	`${commonPath}/clans/search/:name`,
	checkRole([AdminRole.ADMIN]),
	param('name').isString().notEmpty(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await searchClansAdmin(req.params.name);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/clans/:id`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getClanDetailsAdmin(+req.params.id);
			if (!response) {
				return res.status(404).send({ message: 'Clan not found' });
			}
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Change clan name
routes.patch(
	`${commonPath}/clans/:id/name`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	body('name').isString().notEmpty(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const adminId = authed.id;
			const response = await updateClanNameAdmin(+req.params.id, req.body.name, adminId);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Update clan languages
routes.patch(
	`${commonPath}/clans/:id/langs`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	body('langs').isArray(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const adminId = authed.id;
			const response = await updateClanLanguagesAdmin(+req.params.id, req.body.langs, adminId);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Remove clan banner
routes.delete(
	`${commonPath}/clans/:id/banner`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const adminId = authed.id;
			const response = await removeClanBannerAdmin(+req.params.id, adminId);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Update clan pages
routes.put(
	`${commonPath}/clans/pages/:pageId`,
	checkRole([AdminRole.ADMIN]),
	param('pageId').isNumeric(),
	body('name').isString().notEmpty(),
	body('content').isString(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const { name, content } = req.body;
			const response = await prisma.clanPage.update({
				where: { id: +req.params.pageId },
				data: { name, content }
			});

			const authed = await auth(req);
			await createLog(LogType.AdminUpdateClan, authed.id, undefined, `Updated clan page ${req.params.pageId}`);

			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Delete clan page
routes.delete(
	`${commonPath}/clans/pages/:pageId`,
	checkRole([AdminRole.ADMIN]),
	param('pageId').isNumeric(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await prisma.clanPage.delete({
				where: { id: +req.params.pageId }
			});

			const authed = await auth(req);
			await createLog(LogType.AdminUpdateClan, authed.id, undefined, `Deleted clan page ${req.params.pageId}`);

			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Change clan leader
routes.patch(
	`${commonPath}/clans/:id/leader`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	body('newLeaderId').isString().notEmpty(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const adminId = authed.id;
			await setClanLeaderAdmin(+req.params.id, req.body.newLeaderId, adminId);
			return res.sendStatus(200);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Kick clan member
routes.delete(
	`${commonPath}/clans/member/:playerId`,
	checkRole([AdminRole.ADMIN]),
	param('playerId').isString().notEmpty(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const adminId = authed.id;
			const response = await kickClanMemberAdmin(req.params.playerId, adminId);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Delete clan
routes.delete(
	`${commonPath}/clans/:id`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const adminId = authed.id;
			const response = await deleteClanAdmin(+req.params.id, adminId);
			return res.status(200).send(response.toString());
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Update clan treasure gold
routes.patch(
	`${commonPath}/clans/:id/treasure/gold`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	body('amount').isInt({ min: 0 }),
	body('operation').isString().isIn(['add', 'remove']),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const response = await updateClanTreasureGold(+req.params.id, +req.body.amount, req.body.operation, authed.id);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

// Update clan treasure ingredients
routes.patch(
	`${commonPath}/clans/:id/treasure/ingredients`,
	checkRole([AdminRole.ADMIN]),
	param('id').isNumeric(),
	body('ingredientId').isInt({ min: 1 }),
	body('quantity').isInt({ min: 1 }),
	body('operation').isString().isIn(['add', 'remove']),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const authed = await auth(req);
			const response = await updateClanTreasureIngredients(
				+req.params.id,
				+req.body.ingredientId,
				+req.body.quantity,
				req.body.operation,
				authed.id
			);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(`${commonPath}/event/start`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await startClanWarEvent(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(`${commonPath}/dungeon`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
	try {
		const response = await createSeededDungeon(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/dungeon`, checkRole([AdminRole.ADMIN]), async (_req: Request, res: Response) => {
	try {
		const response = await listDungeons();
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/event`, checkRole([AdminRole.ADMIN]), async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getOngoingEvent(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
