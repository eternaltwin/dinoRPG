module.exports = app => {
	const shop = require("../controllers/shop.controller.js");

	var router = require("express").Router();

	// Get all dinoz from dinoz shop
	router.get("/dinoz/:id", shop.getDinozFromDinozShop);

	app.use('/api/shop', router);
};