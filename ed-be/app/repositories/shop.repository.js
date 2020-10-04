const db = require("../models");
const DinozShop = db.dinozShop;
const DinozRace = db.dinozRace;

module.exports = {
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