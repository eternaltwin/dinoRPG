"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constants_1 = require("../utils/constants");
const playerService_1 = require("../business/playerService");
const routes = express_1.Router();
const commonPath = constants_1.apiRoutes.playerRoute;
routes.get(`${commonPath}/commondata`, playerService_1.getCommonData);
exports.default = routes;
//# sourceMappingURL=player.routes.js.map