"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var place = sequelize.define(
    "place",
    {
      placeId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: sequelize_1.DataTypes.STRING,
      },
      canAccessId: {
        type: sequelize_1.DataTypes.BIGINT,
      },
      mapId: {
        type: sequelize_1.DataTypes.BIGINT,
      },
    },
    {
      timestamps: false,
      tableName: "tb_place",
    }
  );
  return place;
}
exports.default = default_1;
//# sourceMappingURL=place.js.map
