module.exports = (sequelize, DataTypes) => {
    var ingredientGrid = sequelize.define("ingredientGrid", {
      gridId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      playerId: {
        type: DataTypes.BIGINT
      },
      etat: {
        type: DataTypes.ARRAY(DataTypes.INTEGER)
      },
      grid: {
        type: DataTypes.ARRAY(DataTypes.INTEGER)
      },
      ingredientGridTypeId: {
        type: DataTypes.BIGINT
      },
      placeId: {
        type: DataTypes.BIGINT
      }
    }, {
      timestamps: false,
      tableName: 'tb_ingredient_grid'
    });

    ingredientGrid.associate = function(models){
        ingredientGrid.belongsTo(models.player, { foreignKey: 'playerId', as: 'player' });
        ingredientGrid.belongsTo(models.place, { foreignKey: 'placeId', as: 'place' });
        ingredientGrid.belongsTo(models.ingredientGridType, { foreignKey: 'ingredientGridTypeId', as: 'ingredientGridType' });
    }
    
    return ingredientGrid;
  };