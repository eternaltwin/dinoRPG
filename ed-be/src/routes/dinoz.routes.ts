import { Router } from 'express';
import {
	getDinozFiche,
	buyDinoz,
	setDinozName,
} from '../business/dinozService.js';
import { apiRoutes } from '../constants/index.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.dinozRoute;

// Get dinoz data from main dinoz page
routes.get(`${commonPath}/fiche/:id`, getDinozFiche);

// When a dinoz is bought in dinoz shop
routes.post(`${commonPath}/buydinoz/:id`, buyDinoz);

// Set dinoz name
routes.put(`${commonPath}/setname/:id`, setDinozName);

export default routes;
