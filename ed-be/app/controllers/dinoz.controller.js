'use strict';

const DinozRepository = require("../repositories/dinoz.repository.js");
const PlayerRepository = require("../repositories/player.repository.js");
const ShopRepository = require("../repositories/shop.repository.js");
const DinozRaceRepository = require("../repositories/dinozRace.respository.js");
const Constants = require("../utils/constants.js");
const db = require("../models");
const Dinoz = db.dinoz;
const Utils = require("../utils/utils.js");

// Create new dinoz
exports.getDinozFromDinozShop = async function(playerId) {
  let dinoz = {};
  let dinozArray = [];
  let raceArray = [Constants.dinozRace.winks, Constants.dinozRace.sirain, Constants.dinozRace.castivore, Constants.dinozRace.nuagoz, 
      Constants.dinozRace.gorilloz, Constants.dinozRace.wanwan, Constants.dinozRace.pigmou, Constants.dinozRace.planaille, Constants.dinozRace.moueffe];
  let randomRace;
  let randomDisplay;
  let rewardArray = [Constants.reward.tropheeHippoclamp, Constants.reward.tropheePteroz, Constants.reward.tropheeRocky];

  // Check if player has rocky, pteroz or hippoclamp trophy
  let player = await PlayerRepository.getRewardFromArray(playerId, rewardArray);
      
  player.reward.forEach(reward => {
      if (reward.name === Constants.reward.tropheeRocky) {
          raceArray.push(Constants.dinozRace.rocky);
      }
      if (reward.name === Constants.reward.tropheeHippoclamp) {
          raceArray.push(Constants.dinozRace.hippoclamp);
      }
      if (reward.name === Constants.reward.tropheePteroz) {
          raceArray.push(Constants.dinozRace.pteroz);
      }
  });

  // Get all buyable races from a dinoz array
  let races = await DinozRaceRepository.getRaceFromArray(raceArray);

  for (var i = 0; i < Constants.nbrDinozInDinozShop; i ++) {
      // Set a random race to the dinoz
      randomRace = Utils.getRandomNumber(1, races.length);
      // Set a random display to the dinoz
      randomDisplay = races[randomRace].swfLetter + '0' + Utils.getCosmetique() + '000';

      // Create dinoz
      dinoz = {
          playerId: parseInt(playerId),
          raceId: races[randomRace].raceId,
          display: randomDisplay
      }

      dinozArray.push(dinoz);
  }

  return dinozArray;
};

// Renvoie la fiche d'un dinoz
exports.getDinozFiche = (req, res) => {
  const id = req.params.id;
  
  DinozRepository.getDinozFiche(id).then(data => {
    var elements = {};
    var objects = [];

    // On ajoute les éléments dans un seul objet élément
    elements.fire = data.dataValues.nbrUpFire;
    elements.wood = data.dataValues.nbrUpWood;
    elements.water = data.dataValues.nbrUpWater;
    elements.light = data.dataValues.nbrUpLight;
    elements.air = data.dataValues.nbrUpAir;

    data.dataValues.elements = elements;

    // Suppression des attributs devenus inutiles
    delete data.dataValues.nbrUpFire;
    delete data.dataValues.nbrUpWood;
    delete data.dataValues.nbrUpWater;
    delete data.dataValues.nbrUpLight;
    delete data.dataValues.nbrUpAir;


    // On récupère les objets qu'à le dinoz sous une seule variable 'object'
    data.assDinozObject.forEach(assDinozObject => {
      objects.push(assDinozObject.object);
    });

    data.dataValues.objects = objects;

    delete data.dataValues.assDinozObject;

    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving dinoz data."
    });
  });
};

// Get all dinoz not frozen from one player
exports.getDinozPlayer = (req, res) => {
  DinozRepository.getDinozPlayer(req.params.id).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving dinoz from player. Id player = " + id
    });
  });
}

exports.buyDinoz = async (req, res) => {
  // Check if player has enough money to buy this dinoz
  let player = await PlayerRepository.getMoney(parseInt(req.body.playerId));

  if (parseInt(player.money) > req.body.dinoz.race.price) {
    let dinoz = {
      name: '',
      isFrozen: false,
      raceId: req.body.dinoz.race.raceId,
      levelId: 1,
      playerId: req.body.playerId,
      placeId: 1,
      display: req.body.dinoz.display,
      life: 100,
      experience: 0,
      canGather: false,
      nbrUpFire: req.body.dinoz.race.nbrFireCase,
      nbrUpWood: req.body.dinoz.race.nbrWoodCase,
      nbrUpWater: req.body.dinoz.race.nbrWaterCase,
      nbrUpLight: req.body.dinoz.race.nbrLightCase,
      nbrUpAir: req.body.dinoz.race.nbrAirCase
    };

    // Set player money
    player.money = parseInt(player.money) - req.body.dinoz.race.price;
    PlayerRepository.setPlayerMoney(player);

    // Create new dinoz in table tb_dinoz
    let dinozCreated = await DinozRepository.create(dinoz);

    // Destroy all dinoz from player shop (tb_dinoz_shop)
    ShopRepository.deleteDinozFromShop(player.playerId);

    // Get new dinoz to fill the shop again
    let dinozArray = this.getDinozFromDinozShop(player.playerId);

    // Create new dinoz in dinoz shop (tb_dinoz_shop)
    ShopRepository.createMultiple(dinozArray);

    res.send(dinozCreated.dinozId);
  } else {
    return res.status(501).send({
        message: "You don't have enough money to buy this dinoz"
    });
  }
}

// Setting dinoz name
exports.setDinozName = (req, res) => {
  DinozRepository.setDinozName(Dinoz.build(req.body.dinoz)).then(function(response) {
    res.send(response);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while updating dinoz name"
    });
  });;
}