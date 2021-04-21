"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPlayerMoneyRequest = exports.getPlayerRewardsRequest = exports.getCommonDataRequest = exports.createPlayer = exports.getPlayerId = void 0;
const models_1 = require("../models");
const getCommonDataRequest = (playerId) => {
    return models_1.Player.findOne({
        attributes: ['money'],
        include: {
            model: models_1.Dinoz,
            attributes: [
                'dinozId',
                'following',
                'display',
                'name',
                'life',
                'experience',
            ],
            where: { isFrozen: false },
            required: false,
            include: [
                {
                    model: models_1.Place,
                    attributes: ['name'],
                    required: false,
                },
            ],
        },
        where: { playerId: playerId },
    });
};
exports.getCommonDataRequest = getCommonDataRequest;
const getPlayerId = (eternalTwinId) => {
    return models_1.Player.findOne({
        attributes: ['playerId'],
        where: { eternalTwinId: eternalTwinId },
    });
};
exports.getPlayerId = getPlayerId;
const createPlayer = (newPlayer) => {
    return models_1.Player.create(newPlayer);
};
exports.createPlayer = createPlayer;
const getPlayerRewardsRequest = (playerId, rewardArray) => {
    return models_1.Player.findOne({
        attributes: ['quetzuBought'],
        include: {
            model: models_1.EpicReward,
            attributes: ['name'],
            where: { name: rewardArray },
            through: {
                attributes: [],
            },
            required: false,
        },
        where: { playerId: playerId },
    });
};
exports.getPlayerRewardsRequest = getPlayerRewardsRequest;
const setPlayerMoneyRequest = (playerId, newMoney) => {
    return models_1.Player.update({
        money: newMoney,
    }, {
        where: { playerId: playerId },
    });
};
exports.setPlayerMoneyRequest = setPlayerMoneyRequest;
//# sourceMappingURL=playerDao.js.map