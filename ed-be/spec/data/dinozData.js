import { dinozId, playerId, display, dinozName } from '../utils/constants.js';

export const getBasicDinoz = {
    params: {
        id: dinozId
    },
    user: {
        playerId: playerId
    }  
}

export const completeDinoz = {
    dinozId: dinozId,
    display: display,
    name: dinozName,
    life: 100,
    experience: 0,
    nbrUpFire: 0,
    nbrUpWood: 0,
    nbrUpWater: 0,
    nbrUpLight: 0,
    nbrUpAir: 0,
    place: {
        name: 'Dinoville'
    },
    level: {
        level: 4,
        experience: 250
    },
    status: {
        name: ''
    },
    object: {
        name: 'Potion d\Irma',
        canBeUsedNow: true,
        canBeEquiped: false,
        price: 900
    }
}
