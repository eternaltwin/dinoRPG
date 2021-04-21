"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerWithRewards = exports.BasicPlayer = void 0;
const constants_1 = require("../../utils/constants");
const constants_2 = require("../utils/constants");
exports.BasicPlayer = {
    playerId: BigInt(constants_2.player.id_1),
};
exports.PlayerWithRewards = {
    playerId: BigInt(constants_2.player.id_1),
    quetzuBought: 0,
    reward: [
        {
            rewardId: BigInt(13214),
            name: constants_1.reward.tropheeHippoclamp,
        },
        {
            rewardId: BigInt(9845),
            name: constants_1.reward.tropheePteroz,
        },
        {
            rewardId: BigInt(79456),
            name: constants_1.reward.tropheeRocky,
        },
        {
            rewardId: BigInt(7974),
            name: constants_1.reward.tropheeQuetzu,
        },
    ],
};
//# sourceMappingURL=playerData.js.map