"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize) {
  var assDinozObject = sequelize.define(
    "tb_ass_dinoz_object",
    {
      id: {
        type: sequelize_1.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      dinozId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
      objectId: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  return assDinozObject;
}
exports.default = default_1;
//# sourceMappingURL=assDinozObject.model.js.map
