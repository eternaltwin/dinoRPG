"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var epicReward = sequelize.define(
    "epicReward",
    {
      rewardId: {
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
      tableName: "tb_epic_reward",
    }
  );
  return epicReward;
}
exports.default = default_1;
//# sourceMappingURL=epicReward.js.map
