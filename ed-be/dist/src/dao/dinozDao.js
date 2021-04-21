"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDinozNameRequest = exports.getCanDinozChangeName = exports.getDinozFicheRequest = exports.createDinozRequest = void 0;
const models_1 = require("../models");
const createDinozRequest = (newDinoz) => {
    return models_1.Dinoz.create(newDinoz);
};
exports.createDinozRequest = createDinozRequest;
const getDinozFicheRequest = (dinozId) => {
    return models_1.Dinoz.findOne({
        attributes: [
            'dinozId',
            'display',
            'life',
            'experience',
            'nbrUpFire',
            'nbrUpWood',
            'nbrUpWater',
            'nbrUpLight',
            'nbrUpAir',
            'name',
        ],
        include: [
            {
                model: models_1.Player,
                attributes: ['playerId'],
                required: false,
            },
            {
                model: models_1.Place,
                attributes: ['name'],
                required: false,
            },
            {
                model: models_1.Level,
                attributes: ['level', 'experience'],
                required: false,
            },
            {
                model: models_1.Status,
                attributes: ['name'],
                through: {
                    attributes: [],
                },
                required: false,
            },
            {
                model: models_1.AssDinozObject,
                attributes: ['id'],
                required: false,
                include: [
                    {
                        model: models_1.Objet,
                        attributes: ['name', 'canBeUsedNow', 'canBeEquiped', 'price'],
                        required: false,
                    },
                ],
            },
        ],
        where: { dinozId: dinozId },
    });
};
exports.getDinozFicheRequest = getDinozFicheRequest;
const getCanDinozChangeName = (dinozId) => {
    return models_1.Dinoz.findOne({
        attributes: ['canChangeName'],
        include: [
            {
                model: models_1.Player,
                attributes: ['playerId'],
                required: false,
            },
        ],
        where: { dinozId: dinozId },
    });
};
exports.getCanDinozChangeName = getCanDinozChangeName;
const setDinozNameRequest = (dinoz) => {
    return models_1.Dinoz.update({
        name: dinoz.name,
        canChangeName: false,
    }, {
        where: { dinozId: dinoz.dinozId },
    });
};
exports.setDinozNameRequest = setDinozNameRequest;
//# sourceMappingURL=dinozDao.js.map