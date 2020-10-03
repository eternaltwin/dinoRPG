module.exports = app => {
	const dinoz = require("../controllers/dinoz.controller.js");

	var router = require("express").Router();

	// Create a new Dinoz
	router.post("/", dinoz.create);

	// Get dinoz data from main dinoz page
	router.get("/fiche/:id", dinoz.getDinozFiche);

	// Get all dinoz not frozen from one player
	router.get("/player/:id", dinoz.getDinozPlayer);

	app.use('/api/dinoz', router);
};