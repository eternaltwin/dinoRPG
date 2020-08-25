module.exports = (sequelize, DataTypes) => {
    var skillType = sequelize.define("skillType", {
      skillTypeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      libelle: {
        type: DataTypes.STRING
      },
    }, {
      timestamps: false,
      tableName: 'tb_skill_type'
    });

    skillType.associate = function(models){
        skillType.hasMany(models.skill, { foreignKey: 'skillTypeId', as: 'skill' });
    }
    
    return skillType;
  };