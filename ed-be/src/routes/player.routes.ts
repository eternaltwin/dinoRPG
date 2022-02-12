import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import {
	getAccountData,
	getCommonData,
	importAccount,
	setCustomText
} from '../business/playerService.js';
import { body, param } from 'express-validator';

const routes: Router = Router();

const commonPath: string = apiRoutes.playerRoute;

routes.get(`${commonPath}/commondata`, getCommonData);

routes.get(
	`${commonPath}/:id`,
	[param('id').exists().isNumeric()],
	getAccountData
);

routes.put(
	`${commonPath}/import`,
	[body('server').exists().isString()],
	importAccount
);

routes.put(
	`${commonPath}/customText`,
	[body('message').exists()],
	setCustomText
);

export default routes;
