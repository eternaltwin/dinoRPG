'use strict';

import db from '../models/index.js';
const Player = db.player;
const EpicReward = db.epicReward;

const playerRepository = {
    getRewardFromArray: (playerId, rewardArray) => {
        return Player.findOne({
            attributes: ['quetzuBought'],
            include: {
                model: EpicReward,
                attributes: ['name'],
                where : { name: rewardArray },
                through: {
                    attributes: []
                },
                as: 'reward',
                required: false
            },
            where: { playerId: playerId }
        });
    },

    getMoney: (playerId) => {
        return Player.findOne({
            attributes: ['playerId', 'money'],
            where: { playerId: playerId }
        });
    },

    setPlayerMoney: (player) => {
        return player.save({
            fields: ['money'],
            where: { playerId: player.playerId }
        });
    },

    getPlayerDetails: (eternalTwinId) => {
        return Player.findOne({
            attributes: ['playerId'],
            where: { eternalTwinId: eternalTwinId }
        });
    },

    create: (newPlayer) => {
        return Player.create(newPlayer);
    }
}

export default playerRepository;