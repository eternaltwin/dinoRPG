"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var dinozShop = sequelize.define(
    "dinozShop",
    {
      id: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      playerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      raceId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      display: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_dinoz_shop",
    }
  );
  return dinozShop;
}
exports.default = default_1;
//# sourceMappingURL=dinozShop.model.js.map
