const db = require("../models");
const DinozRace = db.dinozRace;

module.exports = {
    getRaceFromArray: (raceArray) => {
        return DinozRace.findAll({
            where: { name: raceArray }
        });
    }
}