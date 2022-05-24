import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { getDinozFromDinozShop } from '../business/dinozShopService.js';
import { getItemsFromShop, buyItem } from '../business/itemShopService.js';
import { body, param } from 'express-validator';

const routes: Router = Router();

const commonPath: string = apiRoutes.shopRoutes;

// Get the Dinoz shop
routes.get(`${commonPath}/dinoz`, getDinozFromDinozShop);

// Get the items from a shop
routes.get(`${commonPath}/getShop/:shopId`, [param('shopId').exists().toInt().isNumeric()], getItemsFromShop);

// Buy an item from a shop
routes.put(
	`${commonPath}/buyItem/:shopId`,
	[
		param('shopId').exists().toInt().isNumeric(),
		body('itemId').exists().toInt().isNumeric(),
		body('quantity').exists().toInt().isNumeric()
	],
	buyItem
);

export default routes;
