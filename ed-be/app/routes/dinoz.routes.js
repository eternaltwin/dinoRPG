module.exports = app => {
	const dinoz = require("../controllers/dinoz.controller.js");

	var router = require("express").Router();

	// Create a new Dinoz
	router.post("/", dinoz.create);

	// Retrieve all Dinoz
	router.get("/", dinoz.findAll);

	// Retrieve all frozen Dinoz
	router.get("/frozen", dinoz.findAllFrozen);

	// Retrieve a single Dinoz with id
	router.get("/:id", dinoz.findOne);

	// Update a Dinoz with id
	router.put("/:id", dinoz.update);

	// Delete a Dinoz with id
	router.delete("/:id", dinoz.delete);

	// Create a new Dinoz
	router.delete("/", dinoz.deleteAll);

	// Get dinoz data from main dinoz page
	router.get("/fiche/:id", dinoz.getDinozFiche);

	// Get all dinoz not frozen from one player
	router.get("/player/:id", dinoz.getDinozPlayer);

	app.use('/api/dinoz', router);
};