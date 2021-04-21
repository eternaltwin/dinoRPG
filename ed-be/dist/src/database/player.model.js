"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var player = sequelize.define(
    "player",
    {
      playerId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      eternalTwinId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
      },
      money: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      quetzuBought: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
      },
      leader: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      engineer: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      cooker: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      shopKeeper: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      merchant: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      priest: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
      teacher: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      tableName: "tb_player",
    }
  );
  return player;
}
exports.default = default_1;
//# sourceMappingURL=player.model.js.map
