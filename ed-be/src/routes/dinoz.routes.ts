import { Router } from 'express';
import { body, param } from 'express-validator';
import {
	getDinozFiche,
	buyDinoz,
	setDinozName,
	getDinozSkill,
	setSkillState
} from '../business/dinozService.js';
import { apiRoutes, regex } from '../constants/index.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.dinozRoute;

// Get dinoz data from main dinoz page
routes.get(
	`${commonPath}/fiche/:id`,
	[param('id').exists().toInt().isNumeric()],
	getDinozFiche
);

// When a dinoz is bought in dinoz shop
routes.post(
	`${commonPath}/buydinoz/:id`,
	[param('id').exists().toInt().isNumeric()],
	buyDinoz
);

// Set dinoz name
routes.put(
	`${commonPath}/setname/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('newName').exists().isString().matches(regex.DINOZ_NAME)
	],
	setDinozName
);

// Get dinoz Skill
routes.get(
	`${commonPath}/skill/:id`,
	[param('id').exists().toInt().isNumeric()],
	getDinozSkill
);

// Set skill State
routes.put(
	`${commonPath}/setskillstate/:id`,
	[
		param('id').exists().toInt().isNumeric(),
		body('skillId').exists().toInt().isNumeric(),
		body('skillState').exists().isBoolean()
	],
	setSkillState
);

export default routes;
