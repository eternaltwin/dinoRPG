'use strict';

const dinoz = require("../controllers/dinoz.controller.js");
const router = require("express").Router();

module.exports = app => {
	
	// Get dinoz data from main dinoz page
	router.get("/fiche/:id", dinoz.getDinozFiche);

	// Get all dinoz not frozen from one player
	router.get("/player/:id", dinoz.getDinozPlayer);

	// When a dinoz is bought in dinoz shop
	router.post("/buydinoz", dinoz.buyDinoz);

	// Set dinoz name
	router.put("/setname", dinoz.setDinozName);

	app.use('/api/dinoz', router);
};