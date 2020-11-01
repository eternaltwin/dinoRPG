'use strict';

const player = require("../controllers/player.controller.js");
const router = require("express").Router();

module.exports = app => {
	// Get all dinoz from dinoz shop
	router.get("/money/:id", player.getPlayerMoney);

	app.use('/api/player', router);
};