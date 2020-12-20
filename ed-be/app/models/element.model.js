export default function(sequelize, DataTypes) {
  var elements = sequelize.define("element", {
    elementId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: false,
    tableName: 'tb_element'
  });
  
  return elements;
};