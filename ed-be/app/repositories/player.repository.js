const db = require("../models");
const Player = db.player;
const EpicReward = db.epicReward;

module.exports = {
    getRewardFromArray: (playerId, rewardArray) => {
        return Player.findOne({
            attributes: [],
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
    }
}