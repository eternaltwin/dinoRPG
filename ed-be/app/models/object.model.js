export default function(sequelize, DataTypes) {
  var object = sequelize.define("object", {
    objectId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
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
    }
  }, {
    timestamps: false,
    tableName: 'tb_object'
  });

  object.associate = function(models){
    object.hasMany(models.assDinozObject, { foreignKey: 'objectId', as: 'assDinozObject' });
  }
  
  return object;
};