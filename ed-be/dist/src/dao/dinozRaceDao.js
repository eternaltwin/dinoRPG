"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRacesDetailsRequest = void 0;
const models_1 = require("../models");
const getRacesDetailsRequest = (raceArray) => {
    return models_1.DinozRace.findAll({
        where: { name: raceArray },
    });
};
exports.getRacesDetailsRequest = getRacesDetailsRequest;
//# sourceMappingURL=dinozRaceDao.js.map