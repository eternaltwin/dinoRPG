module.exports = (sequelize, DataTypes) => {
    var ingredient = sequelize.define("ingredient", {
      ingredientId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      ingrName: {
        type: DataTypes.STRING
      },
      ingredientGridTypeId: {
        type: DataTypes.BIGINT,
        allowNull: false
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