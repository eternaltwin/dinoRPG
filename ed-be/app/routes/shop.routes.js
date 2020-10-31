'use strict';

const shop = require("../controllers/shop.controller.js");
const router = require("express").Router();

module.exports = app => {
	// Get all dinoz from dinoz shop
	router.get("/dinoz/:id", shop.getDinozFromDinozShop);

	app.use('/api/shop', router);
};