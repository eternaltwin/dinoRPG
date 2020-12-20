'use strict';

import db from '../models/index.js';
const DinozShop = db.dinozShop;
const DinozRace = db.dinozRace;
const Skill = db.skill;

const shopRepository = {
    createMultiple: (dinozArray) => {
        return DinozShop.bulkCreate(dinozArray);
    },

    getDinozFromDinozShop: (playerId) => {
        return DinozShop.findAll({
            attributes: ['id', 'display'],
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
    },

    deleteDinozFromShop: (playerId) => {
        return DinozShop.destroy({
            where: { playerId: playerId }
        });
    }
}

export default shopRepository;