import { param } from 'express-validator';
import { getRanking } from '../business/rankingService.js';
import { apiRoutes } from '../constants/index.js';
import { Router } from 'express';

const routes: Router = Router();

const commonPath: string = apiRoutes.rankingRoutes;

routes.get(
	`${commonPath}/:sort/:page`,
	[param('sort').exists().isString(), param('page').exists().isNumeric()],
	getRanking
);

export default routes;
