"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var ingredientGrid = sequelize.define(
    "ingredientGrid",
    {
      gridId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      playerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      etat: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.INTEGER),
      },
      grid: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.INTEGER),
        allowNull: false,
      },
      ingredientGridTypeId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      placeId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_ingredient_grid",
    }
  );
  return ingredientGrid;
}
exports.default = default_1;
//# sourceMappingURL=ingredientGrid.model.js.map
