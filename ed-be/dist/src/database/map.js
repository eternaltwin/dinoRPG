"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var map = sequelize.define(
    "map",
    {
      mapId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_map",
    }
  );
  return map;
}
exports.default = default_1;
//# sourceMappingURL=map.js.map
