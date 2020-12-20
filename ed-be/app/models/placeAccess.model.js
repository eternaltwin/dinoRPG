export default function(sequelize, DataTypes) {
  var placeAccess = sequelize.define("placeAccess", {
    canAccessId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    canGoTo: {
      type: DataTypes.BIGINT
    }
  }, {
    timestamps: false,
    tableName: 'tb_place_access'
  });

  placeAccess.associate = function(models){
      placeAccess.belongsTo(models.place, { foreignKey: 'canAccessId', as :'place' });
  }
  
  return placeAccess;
};