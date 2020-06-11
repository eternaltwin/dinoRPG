module.exports = (sequelize, DataTypes) => {
  var dinoz = sequelize.define("dinoz", {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    raceId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
          model: 'tb_dinoz_race',
          key: 'id'
        }
    },
    isFrozen: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'tb_dinoz'
  });

  dinoz.associate = function(models){
    dinoz.belongsTo(models.dinozRace, { foreignKey: 'raceId', targetKey: 'id' });
  }

  return dinoz;
};