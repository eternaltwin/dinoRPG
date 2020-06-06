module.exports = (sequelize, Sequelize) => {
  const Dinoz = sequelize.define("tb_dinoz", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    race: {
      type: Sequelize.STRING
    },
    isFrozen: {
      type: Sequelize.BOOLEAN
    }
  }, {
    tableName: 'tb_dinoz'
  });

  return Dinoz;
};