import { Router } from 'express';
import { getApiData } from '../business/dataService.js';
import { apiRoutes } from '../utils/constants.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.dataRoutes;

routes.get(`${commonPath}/:cookie`, getApiData);

export default routes;
