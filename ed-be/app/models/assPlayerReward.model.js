export default function(sequelize, DataTypes) {
    var assPlayerReward = sequelize.define("tb_ass_player_reward", { }, {
        timestamps: false,
        freezeTableName: true
    });
  
    return assPlayerReward;
};