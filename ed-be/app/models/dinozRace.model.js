module.exports = (sequelize, DataTypes) => {
    var dinozRace = sequelize.define("race", {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true
      },
      libelle: {
        type: DataTypes.STRING
      },
    }, {
      timestamps: false,
      tableName: 'tb_dinoz_race'
    });

    dinozRace.associate = function(models){
      dinozRace.hasOne(models.dinoz);
    }
    
    return dinozRace;
  };