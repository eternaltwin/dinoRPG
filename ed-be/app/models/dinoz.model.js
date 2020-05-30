module.exports = (sequelize, Sequelize) => {
  const Dinoz = sequelize.define("tb_dinoz", {
    name: {
      type: Sequelize.STRING
    },
    race: {
      type: Sequelize.STRING
    },
    isFrozen: {
      type: Sequelize.BOOLEAN
    }
  });

  return Dinoz;
};