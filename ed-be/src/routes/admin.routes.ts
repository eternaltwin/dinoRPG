import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import {
	getAdminDashBoard,
	editDinoz,
	givePlayerEpicReward,
	listAllDinozFromPlayer,
	setPlayerMoney,
	editPlayer,
	listAllPlayerInformationForAdminDashoard
} from '../business/adminService.js';
import { body, param } from 'express-validator';
import { checkIsAdmin } from '../utils/jwt.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.adminRoute;

routes.get(`${commonPath}/dashboard`, checkIsAdmin, getAdminDashBoard);

routes.put(
	`${commonPath}/dinoz/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('name').default(null).optional({ nullable: true }).exists().isString(),
		body('isFrozen').default(null).optional({ nullable: true }).exists().isBoolean(),
		body('isSacrificed').default(null).optional({ nullable: true }).exists().isBoolean(),
		body('level').default(null).optional({ nullable: true }).exists().toInt().isInt(),
		body('placeId').default(null).optional({ nullable: true }).exists().toInt().isInt(),
		body('canChangeName').default(null).optional({ nullable: true }).exists().isBoolean(),
		body('life').default(null).optional({ nullable: true }).exists().toInt().isInt(),
		body('maxLife').default(null).optional({ nullable: true }).exists().toInt().isInt(),
		body('experience').default(null).optional({ nullable: true }).exists().toInt().isInt(),
		body('status').default(null).optional({ nullable: true }).exists().isArray(),
		body('statusOperation').default(null).optional({ nullable: true }).exists().isString(),
		body('skill').default(null).optional({ nullable: true }).exists().isArray(),
		body('skillOperation').default(null).optional({ nullable: true }).exists().isString()
	],
	checkIsAdmin,
	editDinoz
);

routes.put(
	`${commonPath}/gold/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('operation').exists().isString(),
		body('gold').exists().toInt().isNumeric()
	],
	checkIsAdmin,
	setPlayerMoney
);

routes.put(
	`${commonPath}/epic/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('operation').exists().isString(),
		body('epicRewardId').exists().isArray()
	],
	checkIsAdmin,
	givePlayerEpicReward
);

routes.get(
	`${commonPath}/playerdinoz/:id`,
	param('id').exists().toInt().isNumeric(),
	checkIsAdmin,
	listAllDinozFromPlayer
);

routes.put(
	`${commonPath}/player/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('hasImported').default(null).optional().exists().isBoolean(),
		body('customText').default(null).optional().exists(),
		body('quetzuBought').default(null).optional().exists().isNumeric(),
		body('leader').default(null).optional().exists().isBoolean(),
		body('engineer').default(null).optional().exists().isBoolean(),
		body('cooker').default(null).optional().exists().isBoolean(),
		body('shopKeeper').default(null).optional().exists().isBoolean(),
		body('merchant').default(null).optional().exists().isBoolean(),
		body('priest').default(null).optional().exists().isBoolean(),
		body('teacher').default(null).optional().exists().isBoolean()
	],
	checkIsAdmin,
	editPlayer
);

routes.get(
	`${commonPath}/playerinfo/:id`,
	param('id').exists().toInt().isNumeric(),
	checkIsAdmin,
	listAllPlayerInformationForAdminDashoard
);

export default routes;
