'use strict';

import db from '../models/index.js';
const Dinoz = db.dinoz;
const Status = db.status;
const Objects = db.object;
const Level = db.level;
const Place = db.place;
const assDinozObject = db.assDinozObject;

const dinozRepository = {

    create: (newDinoz) => {
        return Dinoz.create(newDinoz);
    },

    // Get data from main dinoz page
    getDinozFiche: (id) => {
        return Dinoz.findOne({
            attributes: ['dinozId', 'display', 'life', 'experience', 'nbrUpFire', 'nbrUpWood', 'nbrUpWater', 'nbrUpLight', 'nbrUpAir', 'name'],
            include: [{
                model: Place,
                attributes: ['name'],
                as: 'place',
                required: false
            }, {
                model: Level,
                attributes: ['level', 'experience'],
                as: 'level',
                required: false
            }, {
                model: Status,
                attributes: ['name'],
                through: {
                    attributes: []
                },
                as: 'status',
                required: false
            }, {
                model: assDinozObject,
                attributes: ['id'],
                as: 'assDinozObject',
                required: false,
                include: {
                    model: Objects,
                    attributes: ['name', 'canBeUsedNow', 'canBeEquiped', 'price'],
                    as: 'object', 
                    required: false
                }
            }],
            where: { dinozId: id }
        });
    },

    // Get all dinoz not frozen from one player
    getDinozPlayer: (id) => {
        return Dinoz.findAll({
            attributes: ['dinozId', 'name', 'display', 'following', 'life'],
            include: [{
                model: Place,
                attributes: ['name'],
                as: 'place',
                required: false
            }],
            where: { playerId: id, isFrozen: false }
        });
    },

    // Setting dinoz name
    setDinozName: (dinoz) => {
        return Dinoz.update({
            name: dinoz.name
        },{
            where: { dinozId: dinoz.dinozId }
        });
    }
}

export default dinozRepository;