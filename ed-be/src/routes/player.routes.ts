import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getCommonData } from '../business/playerService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.playerRoute;

routes.get(`${commonPath}/commondata`, getCommonData);

export default routes;
