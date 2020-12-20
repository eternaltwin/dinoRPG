export default function(sequelize, DataTypes) {
    var assDinozObject = sequelize.define("tb_ass_dinoz_object", { 
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        dinozId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        objectId: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, { 
        timestamps: false,
        freezeTableName: true
    });

    assDinozObject.associate = function(models) {
        assDinozObject.belongsTo(models.dinoz, { foreignKey: 'dinozId', as: 'dinoz' });
        assDinozObject.belongsTo(models.object, { foreignKey: 'objectId', as: 'object' });
    }

    return assDinozObject;
};