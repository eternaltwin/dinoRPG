module.exports = (sequelize, DataTypes) => {
    var ingredientGridType = sequelize.define("ingredientGridType", {
      ingredientGridTypeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      length: {
        type: DataTypes.INTEGER
      },
      width: {
          type: DataTypes.INTEGER
      }
    }, {
      timestamps: false,
      tableName: 'tb_ingredient_grid_type'
    });

    ingredientGridType.associate = function(models){
        ingredientGridType.hasMany(models.ingredientGrid, { foreignKey: 'ingredientGridTypeId', as: 'gridType' });
        ingredientGridType.hasMany(models.ingredient, { foreignKey: 'ingredientGridTypeId', as: 'ingredient', });
    }
    
    return ingredientGridType;
  };