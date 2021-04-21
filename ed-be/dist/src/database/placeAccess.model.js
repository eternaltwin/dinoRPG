"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var placeAccess = sequelize.define(
    "placeAccess",
    {
      canAccessId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      canGoTo: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_place_access",
    }
  );
  return placeAccess;
}
exports.default = default_1;
//# sourceMappingURL=placeAccess.model.js.map
