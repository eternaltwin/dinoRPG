const db = require("../models");
const DinozShop = db.dinozShop;
const DinozRace = db.dinozRace;

module.exports = {
    createMultiple: (dinozArray) => {
        return DinozShop.bulkCreate(dinozArray);
    },

    getDinozFromDinozShop: (playerId) => {
        return DinozShop.findAll({
            attributes: ['display'],
            include: [{
                model: DinozRace,
                attributes: ['name', 'nbrFireCase', 'nbrWoodCase', 'nbrWaterCase', 'nbrLightCase', 'nbrAirCase', 'price'],
                as: 'race',
                required: false
            }],
            where: { playerId: playerId }
        });
    }
}