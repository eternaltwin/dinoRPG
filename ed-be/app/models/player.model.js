module.exports = (sequelize, DataTypes) => {
    var player = sequelize.define("player", {
      playerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      money: {
        type: DataTypes.BIGINT
      },
      leader: {
        type: DataTypes.BOOLEAN
      }, 
      engineer: {
        type: DataTypes.BOOLEAN
      },
      cooker: {
        type: DataTypes.BOOLEAN
      },
      shopKeeper: {
        type: DataTypes.BOOLEAN
      },
      merchant: {
        type: DataTypes.BOOLEAN
      },
      priest: {
        type: DataTypes.BOOLEAN
      },
      teacher: {
        type: DataTypes.BOOLEAN
      }
    }, {
      tableName: 'tb_player'
    });

    player.associate = function(models){
        player.hasMany(models.dinoz, { foreignKey: 'playerId', as: 'dinoz' });
        player.hasMany(models.ingredientGrid, { foreignKey: 'playerId', as: 'ingredientGrid' });
        player.hasMany(models.dinozShop, { foreignKey: 'playerId', as: 'dinozShop' });
        player.belongsToMany(models.epicReward, { through: 'tb_ass_player_reward', as: 'reward', foreignKey: 'playerId' });
    }
    
    return player;
  };