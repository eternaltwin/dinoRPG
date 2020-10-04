module.exports = (sequelize, DataTypes) => {
    var dinozShop = sequelize.define("dinozShop", {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      playerId: {
          type: DataTypes.BIGINT
      },
      raceId: {
          type: DataTypes.BIGINT
      },
      display: {
          type: DataTypes.STRING
      }
    }, {
      timestamps: false,
      tableName: 'tb_dinoz_shop'
    });

    dinozShop.associate = function(models){
        dinozShop.belongsTo(models.dinozRace, { foreignKey: 'raceId', as: 'race' });
        dinozShop.belongsTo(models.player, { foreignKey: 'playerId', as: 'player' });
    }
    
    return dinozShop;
  };