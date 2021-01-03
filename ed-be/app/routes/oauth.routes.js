'use strict';

import oauthController from '../controllers/oauth.controller.js';
import express from 'express';

export default function(app) {
	const router = express.Router();

	router.post('/redirect', (req, res) => {
		res.redirect(oauthController.getAuthorizationUri().toString());
	});

	router.get('/callback', oauthController.getAccessToken);

	app.use('/oauth', router);
};