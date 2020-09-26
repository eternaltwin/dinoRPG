module.exports = (sequelize, DataTypes) => {
    var object = sequelize.define("object", {
      objectId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      canBeUsedNow: {
        type: DataTypes.BOOLEAN
      },
      canBeEquiped: {
        type: DataTypes.BOOLEAN
      },
      price: {
        type: DataTypes.INTEGER
      },
      imgName: {
        type: DataTypes.STRING
      }
    }, {
      timestamps: false,
      tableName: 'tb_object'
    });

    object.associate = function(models){
      object.hasMany(models.assDinozObject, { foreignKey: 'objectId', as: 'assDinozObject' });  
      //object.belongsToMany(models.dinoz, { through: 'tb_ass_dinoz_object', as: 'dinoz', foreignKey: 'objectId' });
    }
    
    return object;
  };