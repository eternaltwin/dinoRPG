const db = require("../models");
const Dinoz = db.dinoz;
const DinozRace = db.dinozRace;

module.exports = {
    findAll: () => {
        return Dinoz.findAll({ 
            attributes: ['id', 'isFrozen', 'name'],
            include: [{ 
                model: DinozRace
            }]
        })
    },

    create: (newDinoz) => {
        return Dinoz.create(newDinoz);
    }
}