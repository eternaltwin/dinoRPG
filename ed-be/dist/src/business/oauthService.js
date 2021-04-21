"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToET = void 0;
const playerDao_1 = require("../dao/playerDao");
const context_1 = require("../utils/context");
const jwt_1 = require("../utils/jwt");
const lodash_1 = require("lodash");
const request_1 = __importDefault(require("request"));
const models_1 = require("../models");
const authenticateToET = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let eternalTwinPlayer;
    // Send authentication to EternalTwin server.
    try {
        eternalTwinPlayer = yield doAuthenticationRequestToET(req.body);
    }
    catch (error) {
        return res.status(500).send({
            message: error || 'Incorrect login or password.',
        });
    }
    // Check if player already exists in database
    let player = yield playerDao_1.getPlayerId(eternalTwinPlayer.body.id);
    const config = context_1.getConfig();
    // If player isn't found in database, create a new one
    if (lodash_1.isNil(player)) {
        player = models_1.Player.build({
            eternalTwinId: eternalTwinPlayer.body.id,
            name: eternalTwinPlayer.body.display_name.current.value,
            money: config.player.initialMoney,
            quetzuBought: 0,
            leader: false,
            engineer: false,
            cooker: false,
            shopKeeper: false,
            merchant: false,
            priest: false,
            teacher: false,
        });
        // Create new player in database
        player = yield playerDao_1.createPlayer(player.get());
    }
    // Forge JWT with playerId
    const JWT = yield jwt_1.forgeJWT(player.get().playerId);
    return res.status(200).send(JWT);
});
exports.authenticateToET = authenticateToET;
function doAuthenticationRequestToET(params) {
    return new Promise((resolve, reject) => {
        request_1.default({
            url: 'http://localhost:50320/api/v1/auth/self?method=Etwin',
            method: 'PUT',
            json: params,
        }, (err, response, html) => {
            if (response.body === 'Internal Server Error') {
                reject(response);
            }
            else {
                resolve(response);
            }
        });
    });
}
//# sourceMappingURL=oauthService.js.map