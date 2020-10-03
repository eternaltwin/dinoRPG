module.exports = (sequelize, DataTypes) => {
  var dinoz = sequelize.define("dinoz", {
    dinozId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    following: {
      type: DataTypes.BIGINT
    },
    name: {
      type: DataTypes.STRING
    },
    isFrozen: {
      type: DataTypes.BOOLEAN
    },
    raceId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    levelId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    missionId: {
      type: DataTypes.BIGINT
    },
    nextUpElementId: {
      type: DataTypes.BIGINT
    },
    nextUpAltElementId: {
      type: DataTypes.BIGINT
    },
    playerId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    placeId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    display: {
      type: DataTypes.STRING,
      allowNull: false
    },
    life: {
      type: DataTypes.INTEGER
    },
    experience: {
      type: DataTypes.INTEGER
    },
    canGather: {
      type: DataTypes.BOOLEAN
    },
    nbrUpFire: {
      type: DataTypes.INTEGER
    },
    nbrUpWood: {
      type: DataTypes.INTEGER
    },
    nbrUpWater: {
      type: DataTypes.INTEGER
    },
    nbrUpLight: {
      type: DataTypes.INTEGER
    },
    nbrUpAir: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'tb_dinoz'
  });

  dinoz.associate = function(models){
    dinoz.belongsTo(models.dinozRace, { foreignKey: 'raceId', as: 'race' });
    dinoz.belongsToMany(models.skill, { through: 'tb_ass_dinoz_skill', as: 'skills', foreignKey: 'dinozId' });
    dinoz.belongsToMany(models.status, { through: 'tb_ass_dinoz_status', as: 'status', foreignKey: 'dinozId' });
    dinoz.hasMany(models.assDinozObject, { foreignKey: 'dinozId', as: 'assDinozObject' });
    dinoz.belongsTo(models.level, { foreignKey: 'levelId', as: 'level' });
    dinoz.belongsTo(models.mission, { foreignKey: 'missionId', as: 'mission' });
    dinoz.belongsTo(models.element, { foreignKey: 'nextUpElementId', as: 'nextUp' });
    dinoz.belongsTo(models.element, { foreignKey: 'nextUpAltElementId', as: 'nextUpAlt' });
    dinoz.belongsTo(models.player, { foreignKey: 'playerId', as: 'player' });
    dinoz.belongsTo(models.place, { foreignKey: 'placeId', as: 'place' });
    dinoz.belongsTo(models.dinoz, { foreignKey: 'following', as: 'followingDinoz' });
  }

  return dinoz;
};