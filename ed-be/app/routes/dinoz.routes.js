'use strict';

import dinozController from '../controllers/dinoz.controller.js';
import express from 'express';

export default function(app) {
	const router = express.Router();

	// Create a new Dinoz
	router.post("/", dinozController.create);

	// Get dinoz data from main dinoz page
	router.get("/fiche/:id", dinozController.getDinozFiche);

	// Get all dinoz not frozen from one player
	router.get("/player/:id", dinozController.getDinozPlayer);

	// When a dinoz is bought in dinoz shop
	router.post("/buydinoz", dinozController.buyDinoz);

	// Set dinoz name
	router.put("/setname", dinozController.setDinozName);

	app.use('/api/dinoz', router);
};