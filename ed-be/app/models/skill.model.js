module.exports = (sequelize, DataTypes) => {
    var skill = sequelize.define("skill", {
      skillId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      type: {
        type: DataTypes.STRING
      }
    }, {
      timestamps: false,
      tableName: 'tb_skill'
    });

    skill.associate = function(models){
        skill.belongsToMany(models.dinoz, { through: 'tb_ass_dinoz_skill', as: 'dinoz', foreignKey: 'skillId' });
        skill.hasOne(models.dinozRace, { foreignKey: 'skillId', as: 'race' });
    }
    
    return skill;
  };