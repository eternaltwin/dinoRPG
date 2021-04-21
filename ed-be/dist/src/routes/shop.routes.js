"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constants_1 = require("../utils/constants");
const shopService_1 = require("../business/shopService");
const routes = express_1.Router();
const commonPath = constants_1.apiRoutes.shopRoutes;
routes.get(`${commonPath}/dinoz`, shopService_1.getDinozFromDinozShop);
exports.default = routes;
//# sourceMappingURL=shop.routes.js.map