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
      description: {
        type: DataTypes.STRING
      },
      skillTypeId: {
        type: DataTypes.BIGINT
      }
    }, {
      timestamps: false,
      tableName: 'tb_skill'
    });

    skill.associate = function(models){
        skill.belongsToMany(models.dinoz, { through: 'tb_ass_dinoz_skill', as: 'dinoz', foreignKey: 'skillId' });
        skill.belongsTo(models.skillType, { foreignKey: 'skillTypeId', as: 'skillType' });
    }
    
    return skill;
  };