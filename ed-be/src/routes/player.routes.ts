import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getAccountData, getCommonData } from '../business/playerService.js';
import { param } from 'express-validator';

const routes: Router = Router();

const commonPath: string = apiRoutes.playerRoute;

routes.get(`${commonPath}/commondata`, getCommonData);

routes.get(
	`${commonPath}/:id`,
	[param('id').exists().isNumeric()],
	getAccountData
);

export default routes;
