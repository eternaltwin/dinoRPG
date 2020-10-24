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
      },
      price: {
        type: DataTypes.INTEGER
      },
      swfLetter: {
        type: DataTypes.STRING
      },
      skillId: {
        type: DataTypes.BIGINT
      }
    }, {
      timestamps: false,
      tableName: 'tb_dinoz_race'
    });

    dinozRace.associate = function(models){
      dinozRace.hasMany(models.dinoz, { foreignKey: 'raceId', as: 'dinoz' });
      dinozRace.hasMany(models.dinozShop, { foreignKey: 'raceId', as: 'race' });
      dinozRace.belongsTo(models.skill, { foreignKey: 'skillId', as: 'skill' });
    }
    
    return dinozRace;
  };