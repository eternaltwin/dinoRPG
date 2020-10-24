const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

var db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Déclaration des tables
db.dinoz = require("./dinoz.model.js")(sequelize, Sequelize);
db.dinozRace = require("./dinozRace.model.js")(sequelize, Sequelize);
db.skill = require("./skill.model.js")(sequelize, Sequelize);
db.assDinozSkill = require("./assDinozSkill.model.js")(sequelize, Sequelize);
db.status = require("./status.model.js")(sequelize, Sequelize);
db.assDinozStatus = require("./assDinozStatus.model.js")(sequelize, Sequelize);
db.object = require("./object.model.js")(sequelize, Sequelize);
db.assDinozObject = require("./assDinozObject.model.js")(sequelize, Sequelize);
db.level = require("./level.model.js")(sequelize, Sequelize);
db.mission = require("./mission.model.js")(sequelize, Sequelize);
db.element = require("./element.model.js")(sequelize, Sequelize);
db.player = require("./player.model.js")(sequelize, Sequelize);
db.place = require("./place.model.js")(sequelize, Sequelize);
db.ingredientGrid = require("./ingredientGrid.model.js")(sequelize, Sequelize);
db.ingredientGridType = require("./ingredientGridType.model.js")(sequelize, Sequelize);
db.ingredient = require("./ingredient.model.js")(sequelize, Sequelize);
db.placeAccess = require("./placeAccess.model.js")(sequelize, Sequelize);
db.map = require("./map.model.js")(sequelize, Sequelize);
db.dinozShop = require("./dinozShop.model.js")(sequelize, Sequelize);
db.epicReward = require("./epicReward.model.js")(sequelize, Sequelize);
db.assPlayerReward = require("./assPlayerReward.model.js")(sequelize, Sequelize);

// Création des associations entre les tables
db.dinoz.associate(db);
db.dinozRace.associate(db);
db.skill.associate(db);
db.status.associate(db);
db.object.associate(db);
db.level.associate(db);
db.mission.associate(db);
db.player.associate(db);
db.place.associate(db);
db.ingredientGrid.associate(db);
db.ingredientGridType.associate(db);
db.ingredient.associate(db);
db.placeAccess.associate(db);
db.map.associate(db);
db.assDinozObject.associate(db);
db.dinozShop.associate(db);
db.epicReward.associate(db);

module.exports = db;