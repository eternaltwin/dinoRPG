"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(sequelize) {
  var assPlayerReward = sequelize.define(
    "tb_ass_player_reward",
    {},
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  return assPlayerReward;
}
exports.default = default_1;
//# sourceMappingURL=assPlayerReward.js.map
