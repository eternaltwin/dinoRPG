export default function(sequelize, DataTypes) {
  var place = sequelize.define("place", {
    placeId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    canAccessId: {
      type: DataTypes.BIGINT
    },
    mapId: {
      type: DataTypes.BIGINT
    }
  }, {
    timestamps: false,
    tableName: 'tb_place'
  });

  place.associate = function(models){
      place.hasMany(models.dinoz, { foreignKey: 'placeId', as: 'dinoz' });
      place.hasMany(models.ingredientGrid, { foreignKey: 'placeId', as: 'ingredientGrid' });
      place.hasMany(models.placeAccess, { foreignKey: 'canAccessId', as: 'placeAccess' });
      place.belongsTo(models.map, { foreignKey: 'mapId', as: 'map' });
  }
  
  return place;
};