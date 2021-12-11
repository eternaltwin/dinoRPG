import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getAllItemsData } from '../business/inventoryService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.inventoryRoute;

routes.get(`${commonPath}/all`, getAllItemsData);

export default routes;
