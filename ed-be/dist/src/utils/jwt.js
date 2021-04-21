"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeJWT = exports.jwtConfig = void 0;
const express_jwt_1 = __importDefault(require("express-jwt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const context_1 = require("./context");
const jwtConfig = () => {
    const config = context_1.getConfig();
    const secret = config.jwt.secretKey;
    return express_jwt_1.default({ secret, algorithms: ['HS256'] }).unless({
        path: ['/api/oauth/authenticate/eternal-twin'],
    });
};
exports.jwtConfig = jwtConfig;
const forgeJWT = (playerId) => {
    const config = context_1.getConfig();
    return jsonwebtoken_1.default.sign({ playerId: playerId }, config.jwt.secretKey);
};
exports.forgeJWT = forgeJWT;
//# sourceMappingURL=jwt.js.map