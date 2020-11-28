'use strict';

const controller = require("../controllers/data.controller.js");
const router = require("express").Router();

module.exports = app => {

    // Get data from Twinoid API
	router.get('/:code/:cookie', controller.getApiData);

	app.use('/api/data', router);
};