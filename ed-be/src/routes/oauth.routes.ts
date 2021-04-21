import { Router } from 'express';
import { authenticateToET } from '../business/oauthService';
import { apiRoutes } from '../utils/constants';

const routes: Router = Router();

const commonPath: string = apiRoutes.oauthRoute;

/*routes.post('/redirect', (req, res) => {
    res.redirect(oauthController.getAuthorizationUri());
});*/

//routes.get('/callback', oauthController.getAccessToken);

routes.put(`${commonPath}/authenticate/eternal-twin`, authenticateToET);

export default routes;
