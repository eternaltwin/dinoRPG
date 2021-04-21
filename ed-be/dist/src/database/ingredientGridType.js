"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var ingredientGridType = sequelize.define(
    "ingredientGridType",
    {
      ingredientGridTypeId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      length: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      width: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_ingredient_grid_type",
    }
  );
  return ingredientGridType;
}
exports.default = default_1;
//# sourceMappingURL=ingredientGridType.js.map
