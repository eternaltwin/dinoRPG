'use strict';

import playerController from '../controllers/player.controller.js';
import express from 'express';

export default function(app) {
	const router = express.Router();

	// Get all dinoz from dinoz shop
	router.get("/money/:id", playerController.getPlayerMoney);

	app.use('/api/player', router);
};