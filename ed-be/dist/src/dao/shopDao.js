"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDinozInShopRequest = exports.getDinozDetailsRequest = exports.createMultipleDinoz = exports.getDinozFromDinozShopRequest = void 0;
const models_1 = require("../models");
const getDinozFromDinozShopRequest = (playerId) => {
    return models_1.DinozShop.findAll({
        attributes: ['id', 'display'],
        include: {
            model: models_1.DinozRace,
            attributes: [
                'raceId',
                'name',
                'nbrFireCase',
                'nbrWoodCase',
                'nbrWaterCase',
                'nbrLightCase',
                'nbrAirCase',
                'price',
            ],
            required: false,
            include: [
                {
                    model: models_1.Skill,
                    attributes: ['name'],
                    required: false,
                },
            ],
        },
        where: { playerId: playerId },
    });
};
exports.getDinozFromDinozShopRequest = getDinozFromDinozShopRequest;
const createMultipleDinoz = (dinozArray) => {
    return models_1.DinozShop.bulkCreate(dinozArray);
};
exports.createMultipleDinoz = createMultipleDinoz;
const getDinozDetailsRequest = (dinozId) => {
    return models_1.DinozShop.findOne({
        attributes: ['display'],
        include: [
            {
                model: models_1.Player,
                attributes: ['playerId', 'money'],
                required: false,
            },
            {
                model: models_1.DinozRace,
                attributes: [
                    'raceId',
                    'nbrFireCase',
                    'nbrWoodCase',
                    'nbrWaterCase',
                    'nbrLightCase',
                    'nbrAirCase',
                    'price',
                ],
                required: false,
            },
        ],
        where: { id: dinozId },
    });
};
exports.getDinozDetailsRequest = getDinozDetailsRequest;
const deleteDinozInShopRequest = (playerId) => {
    return models_1.DinozShop.destroy({
        where: { playerId: playerId },
    });
};
exports.deleteDinozInShopRequest = deleteDinozInShopRequest;
//# sourceMappingURL=shopDao.js.map