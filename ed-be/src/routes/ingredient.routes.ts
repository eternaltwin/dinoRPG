import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getAllIngredientsData } from '../business/ingredientService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.ingredientRoute;

routes.get(`${commonPath}/all`, getAllIngredientsData);

export default routes;
