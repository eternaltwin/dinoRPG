import { playerId, playerId2, rewardName1, rewardName2 } from '../utils/constants.js';

export const basicPlayer = {
    player: {
        playerId: playerId
    },
    money: 100000
}

export const basicPlayer2 = {
    player: {
        playerId: playerId2
    }
}

export const playerWithRewards = {
    player: {
        playerId: playerId
    },
    reward: [
        {
            name: rewardName1
        },
        {
            name: rewardName2
        }
    ]
}