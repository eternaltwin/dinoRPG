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

// Mise en place des Foreign Key
db.dinoz.associate(db);
db.dinozRace.associate(db);

module.exports = db;