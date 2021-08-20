import { Router } from 'express';
import {
	authenticateToET,
	getAuthorizationUri
} from '../business/oauthService.js';
import { apiRoutes } from '../constants/index.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.oauthRoute;

routes.post(`${commonPath}/redirect`, getAuthorizationUri);

routes.put(`${commonPath}/authenticate/eternal-twin`, authenticateToET);

export default routes;
