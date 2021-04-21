"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var missions = sequelize.define(
    "mission",
    {
      missionId: {
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
      tableName: "tb_mission",
    }
  );
  return missions;
}
exports.default = default_1;
//# sourceMappingURL=mission.model.js.map
