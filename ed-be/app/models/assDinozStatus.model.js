export default function(sequelize, DataTypes) {
    var assDinozStatus = sequelize.define("tb_ass_dinoz_status", { }, {
        timestamps: false,
        freezeTableName: true
    });

    return assDinozStatus;
};