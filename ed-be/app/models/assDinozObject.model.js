module.exports = (sequelize, DataTypes) => {
    var assDinozObject = sequelize.define("tb_ass_dinoz_object", { }, {
        timestamps: false,
        freezeTableName: true
    });
  
    return assDinozObject;
  };