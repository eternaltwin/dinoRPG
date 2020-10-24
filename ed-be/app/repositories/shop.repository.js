const db = require("../models");
const DinozShop = db.dinozShop;
const DinozRace = db.dinozRace;
const Skill = db.skill;

module.exports = {
    createMultiple: (dinozArray) => {
        return DinozShop.bulkCreate(dinozArray);
    },

    getDinozFromDinozShop: (playerId) => {
        return DinozShop.findAll({
            attributes: ['display'],
            include: {
                model: DinozRace,
                attributes: ['raceId', 'name', 'nbrFireCase', 'nbrWoodCase', 'nbrWaterCase', 'nbrLightCase', 'nbrAirCase', 'price'],
                as: 'race',
                required: false,
                include: {
                    model: Skill,
                    attributes: ['name'],
                    as: 'skill',
                    required: false
                }
            },
            where: { playerId: playerId }
        });
    }
}