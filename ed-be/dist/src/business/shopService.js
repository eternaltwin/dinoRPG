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
exports.getDinozFromDinozShop = void 0;
const models_1 = require("../models");
const shopDao_1 = require("../dao/shopDao");
const playerDao_1 = require("../dao/playerDao");
const dinozRaceDao_1 = require("../dao/dinozRaceDao");
const lodash_1 = require("lodash");
const constants_1 = require("../utils/constants");
const context_1 = require("../utils/context");
const getDinozFromDinozShop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Retrieve dinoz from dinoz shop if exists
    let data = yield shopDao_1.getDinozFromDinozShopRequest(req.user.playerId);
    // If nothing is found, create 15 dinoz to fill the shop
    if (lodash_1.isEmpty(data)) {
        let dinoz;
        let dinozArray = [];
        let randomRace;
        let randomDisplay;
        const raceArray = [
            constants_1.race.winks,
            constants_1.race.sirain,
            constants_1.race.castivore,
            constants_1.race.nuagoz,
            constants_1.race.gorilloz,
            constants_1.race.wanwan,
            constants_1.race.pigmou,
            constants_1.race.planaille,
            constants_1.race.moueffe,
        ];
        const rewardArray = [
            constants_1.reward.tropheeHippoclamp,
            constants_1.reward.tropheePteroz,
            constants_1.reward.tropheeRocky,
            constants_1.reward.tropheeQuetzu,
        ];
        const config = context_1.getConfig();
        // Check if player has Rocky, Pteroz, Hippoclamp or Quetzu trophy
        const player = yield playerDao_1.getPlayerRewardsRequest(req.user.playerId, rewardArray);
        if (lodash_1.isNull(player)) {
            return res.status(500).send('Player not found');
        }
        player.reward.forEach((playerReward) => {
            if (playerReward.name === constants_1.reward.tropheeRocky) {
                raceArray.push(constants_1.race.rocky);
            }
            if (playerReward.name === constants_1.reward.tropheeHippoclamp) {
                raceArray.push(constants_1.race.hippoclamp);
            }
            if (playerReward.name === constants_1.reward.tropheePteroz) {
                raceArray.push(constants_1.race.pteroz);
            }
            if (playerReward.name === constants_1.reward.tropheeQuetzu &&
                player.quetzuBought < config.shop.buyableQuetzu) {
                raceArray.push(constants_1.race.quetzu);
            }
        });
        // Get all buyable races from a dinoz array
        let races = yield dinozRaceDao_1.getRacesDetailsRequest(raceArray);
        // Make 15 Dinoz object
        for (let i = 0; i < config.shop.dinozInShop; i++) {
            // Set a random race to the dinoz
            randomRace = getRandomNumber(1, races.length);
            // Set a random display to the dinoz
            randomDisplay = `${races[randomRace].swfLetter}0${getCosmetique()}000`;
            dinoz = models_1.Dinoz.build({
                playerId: req.user.playerId,
                raceId: races[randomRace].raceId,
                display: randomDisplay,
            });
            dinozArray.push(dinoz.get());
        }
        // Save created dinoz in database
        yield shopDao_1.createMultipleDinoz(dinozArray);
        // Get created dinoz and their races
        let response = yield shopDao_1.getDinozFromDinozShopRequest(req.user.playerId);
        response = lodash_1.orderBy(response, ['id', 'desc']);
        return res.status(200).send(response);
    }
    else {
        data = lodash_1.orderBy(data, ['id', 'desc']);
        return res.status(200).send(data);
    }
});
exports.getDinozFromDinozShop = getDinozFromDinozShop;
// Return a String with a length of 11
function getCosmetique() {
    var params = {
        includeUpperCase: true,
        includeNumbers: true,
        length: 11,
    };
    return strRandom(params);
}
// Generate random number or letter
function strRandom(o) {
    var a = 10, b = 'abcdefghijklmnopqrstuvwxyz', c = '', d = 0, e = '' + b;
    if (o) {
        if (o.startsWithLowerCase) {
            c = b[Math.floor(Math.random() * b.length)];
            d = 1;
        }
        if (o.length) {
            a = o.length;
        }
        if (o.includeUpperCase) {
            e += b.toUpperCase();
        }
        if (o.includeNumbers) {
            e += '1234567890';
        }
    }
    for (; d < a; d++) {
        c += e[Math.floor(Math.random() * e.length)];
    }
    return c;
}
// Return a random number [min, max[
function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
//# sourceMappingURL=shopService.js.map