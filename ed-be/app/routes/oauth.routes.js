'use strict';

import oauthController from '../controllers/oauth.controller.js';
import express from 'express';

export default function(app) {
	const router = express.Router();

	router.post('/redirect', (req, res) => {
		res.redirect(oauthController.getAuthorizationUri());
	});

	router.get('/callback', oauthController.getAccessToken);

	router.put('/authenticate/eternal-twin', oauthController.authenticateToET);

	app.use('/api/oauth', router);
};