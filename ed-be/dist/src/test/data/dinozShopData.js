"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DinozShopArray = exports.DinozFromShop = void 0;
const constants_1 = require("../utils/constants");
exports.DinozFromShop = {
    id: BigInt(constants_1.dinozId),
    display: 'sdf8s165fs',
    player: {
        playerId: BigInt(constants_1.player.id_1),
        money: BigInt(200000),
    },
    race: {
        raceId: BigInt(1),
        nbrFireCase: 0,
        nbrWoodCase: 2,
        nbrWaterCase: 5,
        nbrLightCase: 3,
        nbrAirCase: 4,
        price: 200,
    },
};
exports.DinozShopArray = [
    exports.DinozFromShop,
    exports.DinozFromShop,
];
//# sourceMappingURL=dinozShopData.js.map