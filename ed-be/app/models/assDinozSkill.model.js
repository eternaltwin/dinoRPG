module.exports = (sequelize, DataTypes) => {
    var assDinozSkill = sequelize.define("tb_ass_dinoz_skill", { }, {
        timestamps: false,
        freezeTableName: true
    });
  
    return assDinozSkill;
  };