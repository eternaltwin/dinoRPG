import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import {
	getAdminDashBoard,
	editDinoz,
	givePlayerEpic,
	listAllDinozFromPlayer,
	setPlayerMoney,
	editPlayer
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
		body('name').default(null).optional().exists().isString(),
		body('isFrozen').default(null).optional().exists().isBoolean(),
		body('isSacrificed').default(null).optional().exists().isBoolean(),
		body('level').default(null).optional().exists().isNumeric(),
		body('placeId').default(null).optional().exists().isNumeric(),
		body('canChangeName').default(null).optional().exists().isBoolean(),
		body('life').default(null).optional().exists().isNumeric(),
		body('maxLife').default(null).optional().exists().isNumeric(),
		body('experience').default(null).optional().exists().isNumeric(),
		body('addStatus').default(null).optional().exists().isNumeric(),
		body('removeStatus').default(null).optional().exists().isNumeric(),
		body('addSkill').default(null).optional().exists().isNumeric(),
		body('removeSkill').default(null).optional().exists().isNumeric()
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
		body('epicRewardId').exists().toInt().isNumeric()
	],
	checkIsAdmin,
	givePlayerEpic
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

export default routes;
