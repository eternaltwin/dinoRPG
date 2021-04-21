import { Router } from 'express';
import { apiRoutes } from '../utils/constants';
import { getCommonData } from '../business/playerService';

const routes: Router = Router();

const commonPath: string = apiRoutes.playerRoute;

routes.get(`${commonPath}/commondata`, getCommonData);

export default routes;
