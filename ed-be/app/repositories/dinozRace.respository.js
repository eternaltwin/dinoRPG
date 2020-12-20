'use strict';

import db from '../models/index.js';
const DinozRace = db.dinozRace;

const dinozRaceRepository = {
    getRaceFromArray: (raceArray) => {
        return DinozRace.findAll({
            where: { name: raceArray }
        });
    }
}

export default dinozRaceRepository;