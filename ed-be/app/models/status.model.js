module.exports = (sequelize, DataTypes) => {
    var status = sequelize.define("status", {
      statusId: {
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
      imgName: {
        type: DataTypes.STRING
      }
    }, {
      timestamps: false,
      tableName: 'tb_status'
    });

    status.associate = function(models){
        status.belongsToMany(models.dinoz, { through: 'tb_ass_dinoz_status', as: 'dinoz', foreignKey: 'statusId'});
    }
    
    return status;
  };