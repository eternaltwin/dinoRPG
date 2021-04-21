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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDinozName = exports.buyDinoz = exports.getDinozFiche = void 0;
const shopDao_1 = require("../dao/shopDao");
const playerDao_1 = require("../dao/playerDao");
const dinozDao_1 = require("../dao/dinozDao");
const models_1 = require("../models");
const lodash_1 = require("lodash");
const getDinozFiche = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dinozId = parseInt(req.params.id);
    // Retrieve player from dinozId
    const dinozDetails = yield dinozDao_1.getDinozFicheRequest(dinozId);
    // If player found is different from player who do the request, throw exception
    if (Number(dinozDetails.player.playerId) !== Number(req.user.playerId)) {
        return res.status(500).send({
            message: 'Cannot get dinoz details, dinozId : ' +
                dinozId +
                ', playerId : ' +
                req.user.playerId,
        });
    }
    return res.status(200).send(dinozDetails);
});
exports.getDinozFiche = getDinozFiche;
const buyDinoz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get dinoz details thanks to his ID
    const dinozData = yield shopDao_1.getDinozDetailsRequest(parseInt(req.params.id));
    if (lodash_1.isNull(dinozData)) {
        return res.status(500).send('Error: dinoz data cannot be null');
    }
    // Throws an exception if player doesn't have enough money to buy the dinoz
    if (dinozData.player.money < dinozData.race.price) {
        return res
            .status(500)
            .send("You don't have enough money to buy this dinoz");
    }
    // Throw unauthorized error if dinoz doesn't belong to player shop
    if (Number(dinozData.player.playerId) !== Number(req.user.playerId)) {
        return res
            .status(500)
            .send("Unauthorized action, you can't buy this dinoz");
    }
    const newDinoz = models_1.Dinoz.build({
        name: '?',
        isFrozen: false,
        raceId: dinozData.race.raceId,
        levelId: 1,
        playerId: req.user.playerId,
        placeId: 1,
        display: dinozData.display,
        life: 100,
        experience: 0,
        canChangeName: true,
        canGather: false,
        nbrUpFire: dinozData.race.nbrFireCase,
        nbrUpWood: dinozData.race.nbrWoodCase,
        nbrUpWater: dinozData.race.nbrWaterCase,
        nbrUpLight: dinozData.race.nbrLightCase,
        nbrUpAir: dinozData.race.nbrAirCase,
    });
    // Set player money
    const newMoney = Number(dinozData.player.money) - dinozData.race.price;
    yield playerDao_1.setPlayerMoneyRequest(req.user.playerId, newMoney);
    // Delete all dinoz from dinoz shop
    yield shopDao_1.deleteDinozInShopRequest(req.user.playerId);
    // Create a new dinoz that belongs to player
    const dinozCreated = yield dinozDao_1.createDinozRequest(newDinoz.get());
    const dinozToSend = {
        dinozId: Number(dinozCreated.dinozId),
        display: dinozCreated.display,
        experience: dinozCreated.experience,
        following: Number(dinozCreated.following),
        life: dinozCreated.life,
        name: dinozCreated.name,
        place: { name: 'dinoville' },
    };
    return res.status(200).send(dinozToSend);
});
exports.buyDinoz = buyDinoz;
const setDinozName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Retrieve player from dinozId
    const dinoz = yield dinozDao_1.getCanDinozChangeName(parseInt(req.params.id));
    // If authenticated player is different from player found, throw exception
    if (Number(dinoz.player.playerId) !== Number(req.user.playerId)) {
        return res.status(500).send({
            message: 'Unauthorized action from player : ' + req.user.playerId,
        });
    }
    else if (!dinoz.canChangeName) {
        return res.status(500).send({
            message: "Can't update dinoz name",
        });
    }
    const dinozToUpdate = models_1.Dinoz.build({
        dinozId: req.params.id,
        name: req.body.newName,
    });
    yield dinozDao_1.setDinozNameRequest(dinozToUpdate);
    return res.status(200).send();
});
exports.setDinozName = setDinozName;
//# sourceMappingURL=dinozService.js.map