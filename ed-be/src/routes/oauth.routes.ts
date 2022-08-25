import { Request, Response, Router } from 'express';
import { authenticateToET, getAuthorizationUri } from '../business/oauthService.js';
import { apiRoutes } from '../constants/index.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.oauthRoute;

/**
 * @openapi
 * /api/v1/oauth/redirect:
 *   post:
 *     summary: Get the URL to authenticate at Eternal Twin
 *     tags:
 *       - Oauth
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: URL to authenticate at Eternal Twin
 */
routes.post(`${commonPath}/redirect`, async (_req: Request, res: Response) => {
	try {
		const response: URL = await getAuthorizationUri();
		return res.status(200).send(response);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send(err.message);
	}
});

/**
 * @openapi
 * /api/v1/oauth/authenticate/eternal-twin:
 *   put:
 *     summary: Authenticate at Eternal Twin
 *     tags:
 *       - Oauth
 *     consume:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         desccription: access token
 *         schema:
 *           type: object
 *           required:
 *             - code
 *           properties:
 *             code:
 *               type: string
 *     responses:
 *       200:
 *         description: Player's JWT
 */
routes.put(`${commonPath}/authenticate/eternal-twin`, async (req: Request, res: Response) => {
	try {
		const response: string = await authenticateToET(req);
		return res.status(200).send(response);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send(err.message);
	}
});

export default routes;
