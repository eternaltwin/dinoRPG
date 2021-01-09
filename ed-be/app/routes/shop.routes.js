'use strict';

import shopController from '../controllers/shop.controller.js';
import express from 'express';

export default function(app) {
	const router = express.Router();

	// Get all dinoz from dinoz shop
	router.get('/dinoz', shopController.getDinozFromDinozShop);

	app.use('/api/shop', router);
};