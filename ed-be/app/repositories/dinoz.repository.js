const db = require("../models");
const { level, player } = require("../models");
const Dinoz = db.dinoz;
const DinozRace = db.dinozRace;
const Skill = db.skill;
const SkillType = db.skillType;
const Status = db.status;
const DinozData = db.dinozData;
const Objects = db.object;
const Level = db.level;
const Mission = db.mission;
const Elements = db.element;
const Player = db.player;
const Place = db.place;
const IngredientGrid = db.ingredientGrid;

module.exports = {
    findAll: () => {
        return Dinoz.findAll({ 
            attributes: ['dinozId', 'isFrozen', 'name'],
            include: [
            { 
                model: DinozRace,
                as: 'race',
                required: false
            }, {
                model: Skill,
                attributes: ['name', 'description'],
                through: {
                    attributes: []
                },
                as: 'skills',
                include: [{
                    model: SkillType,
                    as: 'skillType'
                }],
                required: false
            }, {
                model: Status,
                attributes: ['name', 'description'],
                through: {
                    attributes: []
                },
                as: 'status',
                required: false
            }, {
                model: Objects,
                attributes: ['name', 'description', 'canBeUsedNow', 'canBeEquiped'],
                through: {
                    attributes: []
                },
                as: 'objects', 
                required: false
            }, {
                model: Level,
                as: 'level',
                required: false
            }, {
                model: Mission,
                attributes: ['name', 'description'],
                as: 'mission',
                required: false
            }, {
                model: Elements,
                as: 'nextUp',
                required: false
            }, {
                model: Elements,
                as: 'nextUpAlt',
                required: false
            }, {
                model: Player,
                attributes: ['name'],
                as: 'player',
                required: false
            }, {
                model: Place,
                attributes: ['name', 'description'],
                include: {
                    model: IngredientGrid,
                    where: { placeId: 1, playerId: 1 },
                    as: 'ingredientGrid',
                    required: false
                },
                as: 'place',
                required: false
            }],
            required: false
        })
    },

    create: (newDinoz) => {
        return Dinoz.create(newDinoz);
    }
}