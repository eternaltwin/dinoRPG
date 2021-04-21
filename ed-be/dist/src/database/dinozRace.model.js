"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var dinozRace = sequelize.define(
    "race",
    {
      raceId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
      nbrFireCase: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrWoodCase: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrWaterCase: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrLightCase: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      nbrAirCase: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      swfLetter: {
        type: sequelize_1.DataTypes.STRING,
      },
      skillId: {
        type: sequelize_1.DataTypes.BIGINT,
      },
    },
    {
      timestamps: false,
      tableName: "tb_dinoz_race",
    }
  );
  return dinozRace;
}
exports.default = default_1;
//# sourceMappingURL=dinozRace.model.js.map
