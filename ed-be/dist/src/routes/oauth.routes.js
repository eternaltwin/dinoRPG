"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oauthService_1 = require("../business/oauthService");
const constants_1 = require("../utils/constants");
const routes = express_1.Router();
const commonPath = constants_1.apiRoutes.oauthRoute;
/*routes.post('/redirect', (req, res) => {
    res.redirect(oauthController.getAuthorizationUri());
});*/
//routes.get('/callback', oauthController.getAccessToken);
routes.put(`${commonPath}/authenticate/eternal-twin`, oauthService_1.authenticateToET);
exports.default = routes;
//# sourceMappingURL=oauth.routes.js.map