"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var dinoz = sequelize.define(
    "dinoz",
    {
      dinozId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      following: {
        type: sequelize_1.DataTypes.BIGINT,
      },
      name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
      isFrozen: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      raceId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      levelId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      missionId: {
        type: sequelize_1.DataTypes.BIGINT,
      },
      nextUpElementId: {
        type: sequelize_1.DataTypes.BIGINT,
      },
      nextUpAltElementId: {
        type: sequelize_1.DataTypes.BIGINT,
      },
      playerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      placeId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      display: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
      life: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      experience: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      canGather: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      nbrUpFire: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrUpWood: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrUpWater: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrUpLight: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrUpAir: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "tb_dinoz",
    }
  );
  return dinoz;
}
exports.default = default_1;
//# sourceMappingURL=dinoz.model.js.map
