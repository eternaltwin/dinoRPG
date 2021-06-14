import { Router } from 'express';
import { apiRoutes } from '../utils/constants.js';
import { getDinozFromDinozShop } from '../business/shopService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.shopRoutes;

routes.get(`${commonPath}/dinoz`, getDinozFromDinozShop);

export default routes;
