export default function(sequelize, DataTypes) {
    var assDinozSkill = sequelize.define("tb_ass_dinoz_skill", { }, {
        timestamps: false,
        freezeTableName: true
    });

    return assDinozSkill;
};