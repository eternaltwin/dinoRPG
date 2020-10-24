const { epicReward } = require(".");

module.exports = (sequelize, DataTypes) => {
    var epicReward = sequelize.define("epicReward", {
      rewardId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      }
    }, {
      timestamps: false,
      tableName: 'tb_epic_reward'
    });

    epicReward.associate = function(models) {
        epicReward.belongsToMany(models.player, { through: 'tb_ass_player_reward', as: 'player', foreignKey: 'rewardId' });
    }
    
    return epicReward;
  };

  