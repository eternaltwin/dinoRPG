"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dinozService_1 = require("../business/dinozService");
const constants_1 = require("../utils/constants");
const routes = express_1.Router();
const commonPath = constants_1.apiRoutes.dinozRoute;
// Get dinoz data from main dinoz page
routes.get(`${commonPath}/fiche/:id`, dinozService_1.getDinozFiche);
// When a dinoz is bought in dinoz shop
routes.post(`${commonPath}/buydinoz/:id`, dinozService_1.buyDinoz);
// Set dinoz name
routes.put(`${commonPath}/setname/:id`, dinozService_1.setDinozName);
exports.default = routes;
//# sourceMappingURL=dinoz.routes.js.map