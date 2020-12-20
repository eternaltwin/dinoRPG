export default function(sequelize, DataTypes) {
  var map = sequelize.define("map", {
    mapId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: false,
    tableName: 'tb_map'
  });

  map.associate = function(models){
      map.hasMany(models.place, { foreignKey: 'mapId', as: 'place' });
  }
  
  return map;
};