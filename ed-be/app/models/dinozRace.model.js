module.exports = (sequelize, DataTypes) => {
    var dinozRace = sequelize.define("race", {
      raceId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      nbrFireCase: {
        type: DataTypes.INTEGER
      },
      nbrWoodCase: {
        type: DataTypes.INTEGER
      },
      nbrWaterCase: {
        type: DataTypes.INTEGER
      },
      nbrLightCase: {
        type: DataTypes.INTEGER
      },
      nbrAirCase: {
        type: DataTypes.INTEGER
      }
    }, {
      timestamps: false,
      tableName: 'tb_dinoz_race'
    });

    dinozRace.associate = function(models){
      dinozRace.hasMany(models.dinoz, { foreignKey: 'raceId', as: 'dinoz' });
    }
    
    return dinozRace;
  };