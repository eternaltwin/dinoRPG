"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var ingredient = sequelize.define(
    "ingredient",
    {
      ingredientId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
      ingredientGridTypeId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      price: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_ingredient",
    }
  );
  return ingredient;
}
exports.default = default_1;
//# sourceMappingURL=ingredient.model.js.map
