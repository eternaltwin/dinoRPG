module.exports = (sequelize, DataTypes) => {
    var ingredient = sequelize.define("ingredient", {
      ingredientId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      ingredientGridTypeId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING
      },
      price: {
        type: DataTypes.INTEGER
      }
    }, {
      timestamps: false,
      tableName: 'tb_ingredient'
    });

    ingredient.associate = function(models){
        ingredient.belongsTo(models.ingredientGridType, { foreignKey: 'ingredientGridTypeId', as: 'ingrGridType' });
    }
    
    return ingredient;
  };