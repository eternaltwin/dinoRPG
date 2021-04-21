"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var level = sequelize.define(
    "level",
    {
      levelId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      level: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      experience: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_level",
    }
  );
  return level;
}
exports.default = default_1;
//# sourceMappingURL=level.model.js.map
