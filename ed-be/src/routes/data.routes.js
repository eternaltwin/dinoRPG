import dataController from '../controllers/data.controller.js';
import express from 'express';

export default function(app) {
	const router = express.Router();
		
    // Get data from Twinoid API
	router.get('/:code/:cookie', dataController.getApiData);

	app.use('/api/data', router);
};
