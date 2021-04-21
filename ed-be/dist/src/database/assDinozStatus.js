"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(sequelize) {
  var assDinozStatus = sequelize.define(
    "tb_ass_dinoz_status",
    {},
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  return assDinozStatus;
}
exports.default = default_1;
//# sourceMappingURL=assDinozStatus.js.map
