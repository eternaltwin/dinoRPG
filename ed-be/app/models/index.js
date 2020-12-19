import dbConfig from '../config/db.config.js';
import Sequelize from 'sequelize';

import dinoz from './dinoz.model.js';
import dinozRace from './dinozRace.model.js';
import skill from './skill.model.js';
import assDinozSkill from './assDinozSkill.model.js';
import status from './status.model.js';
import assDinozStatus from './assDinozStatus.model.js';
import object from './object.model.js';
import assDinozObject from './assDinozObject.model.js';
import level from './level.model.js';
import mission from './mission.model.js';
import element from './element.model.js';
import player from './player.model.js';
import place from './place.model.js';
import ingredientGrid from './ingredientGrid.model.js';
import ingredientGridType from './ingredientGridType.model.js';
import ingredient from './ingredient.model.js';
import placeAccess from './placeAccess.model.js';
import map from './map.model.js';
import dinozShop from './dinozShop.model.js';
import epicReward from './epicReward.model.js';
import assPlayerReward from './assPlayerReward.model.js';

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
db.dinoz = dinoz(sequelize, Sequelize);
db.dinozRace = dinozRace(sequelize, Sequelize);
db.skill = skill(sequelize, Sequelize);
db.assDinozSkill = assDinozSkill(sequelize, Sequelize);
db.status = status(sequelize, Sequelize);
db.assDinozStatus = assDinozStatus(sequelize, Sequelize);
db.object = object(sequelize, Sequelize);
db.assDinozObject = assDinozObject(sequelize, Sequelize);
db.level = level(sequelize, Sequelize);
db.mission = mission(sequelize, Sequelize);
db.element = element(sequelize, Sequelize);
db.player = player(sequelize, Sequelize);
db.place = place(sequelize, Sequelize);
db.ingredientGrid = ingredientGrid(sequelize, Sequelize);
db.ingredientGridType = ingredientGridType(sequelize, Sequelize);
db.ingredient = ingredient(sequelize, Sequelize);
db.placeAccess = placeAccess(sequelize, Sequelize);
db.map = map(sequelize, Sequelize);
db.dinozShop = dinozShop(sequelize, Sequelize);
db.epicReward = epicReward(sequelize, Sequelize);
db.assPlayerReward = assPlayerReward(sequelize, Sequelize);

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

export default db;