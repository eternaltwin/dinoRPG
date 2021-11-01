import { Router } from 'express';
import {
	getDinozFiche,
	buyDinoz,
	setDinozName,
	getDinozSkill,
	setSkillState
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

// Get dinoz Skill
routes.get(`${commonPath}/skill/:id`, getDinozSkill);

// Set skill State
routes.put(`${commonPath}/setskillstate/:id`, setSkillState);

export default routes;
