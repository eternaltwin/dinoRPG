export default function(sequelize, DataTypes) {
  var level = sequelize.define("level", {
    levelId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    level: {
      type: DataTypes.BIGINT
    },
    experience: {
        type: DataTypes.BIGINT
    }
  }, {
    timestamps: false,
    tableName: 'tb_level'
  });

  level.associate = function(models){
      level.hasMany(models.dinoz, { foreignKey: 'levelId', as: 'dinoz' });
  }
  
  return level;
};