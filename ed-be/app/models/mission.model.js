module.exports = (sequelize, DataTypes) => {
    var missions = sequelize.define("mission", {
      missionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      description: {
          type: DataTypes.STRING
      }
    }, {
      timestamps: false,
      tableName: 'tb_mission'
    });

    missions.associate = function(models){
        missions.hasMany(models.dinoz, { foreignKey: 'missionId', as: 'dinoz' });
    }
    
    return missions;
  };