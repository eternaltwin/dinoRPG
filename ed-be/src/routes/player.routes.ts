import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import {
	getAccountData,
	getCommonData,
	importAccount,
	setCustomText,
	searchPlayers
} from '../business/playerService.js';
import { body, param } from 'express-validator';

const routes: Router = Router();

const commonPath: string = apiRoutes.playerRoute;

routes.get(`${commonPath}/commondata`, getCommonData);

routes.get(`${commonPath}/:id`, [param('id').exists().isNumeric()], getAccountData);

routes.put(`${commonPath}/import`, [body('server').exists().isString()], importAccount);

routes.put(`${commonPath}/customText`, [body('message').exists()], setCustomText);

routes.get(`${commonPath}/search/:name`, [param('name').exists().isString().isLength({ min: 3 })], searchPlayers);

export default routes;
