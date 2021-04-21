"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var skill = sequelize.define(
    "skill",
    {
      skillId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "tb_skill",
    }
  );
  return skill;
}
exports.default = default_1;
//# sourceMappingURL=skill.js.map
