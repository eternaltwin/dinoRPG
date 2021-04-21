import { Router } from 'express';
import { apiRoutes } from '../utils/constants';
import { getDinozFromDinozShop } from '../business/shopService';

const routes: Router = Router();

const commonPath: string = apiRoutes.shopRoutes;

routes.get(`${commonPath}/dinoz`, getDinozFromDinozShop);

export default routes;
