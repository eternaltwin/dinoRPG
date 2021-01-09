'use strict';

import DinozRepository from '../repositories/dinoz.repository.js';
import PlayerRepository from '../repositories/player.repository.js';
import ShopRepository from '../repositories/shop.repository.js';
import db from '../models/index.js';

const Dinoz = db.dinoz;

const dinozController = {

  // Create and Save a new Dinoz
  create: (req, res) => {
    // Validate request
    if (!req.body.name) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    // Save Dinoz in the database
    DinozRepository.create(req.body)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Dinoz."
        });
      });
  },

  // Renvoie la fiche d'un dinoz
  getDinozFiche: async (req, res) => {
    const dinozId = req.params.id;

    // Retrieve player from dinozId
    const player = await DinozRepository.getPlayerFromDinozId(dinozId);

    if (player.player.playerId !== req.user.playerId) {
      res.status(401).send({
        message: 'Cannot get dinoz details, dinoz : ' + dinozId + ', playerId : ' + req.user.playerId
      });
      return;
    }

    DinozRepository.getDinozFiche(dinozId).then(data => {
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
  },

  // Get all dinoz not frozen from one player
  getDinozPlayer: (req, res) => {
    DinozRepository.getDinozPlayer(req.user.playerId).then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dinoz from player. Id player = " + id
      });
    });
  },

  buyDinoz: async (req, res) => {
    // Check if player has enough money to buy this dinoz
    const player = await PlayerRepository.getMoney(parseInt(req.user.playerId));

    // Get dinoz details from dinozId
    const dinoz = await ShopRepository.getDinozDetails(req.body.dinozId);

    // Throw unauthorized error if dinoz doesn't belong to player shop
    if (dinoz.player.playerId !== req.user.playerId) {
      res.status(401).send({
        message: 'Unauthorized action, you can\'t buy this dinoz'
      });
      return;
    }

    // TODO: add skill to dinoz
    if (parseInt(player.money) > dinoz.race.price) {
      const newDinoz = {
        name: '?',
        isFrozen: false,
        raceId: dinoz.race.raceId,
        levelId: 1,
        playerId: req.user.playerId,
        placeId: 1,
        display: dinoz.display,
        life: 100,
        experience: 0,
        canGather: false,
        nbrUpFire: dinoz.race.nbrFireCase,
        nbrUpWood: dinoz.race.nbrWoodCase,
        nbrUpWater: dinoz.race.nbrWaterCase,
        nbrUpLight: dinoz.race.nbrLightCase,
        nbrUpAir: dinoz.race.nbrAirCase
      };

      // Set player money
      player.money = parseInt(player.money) - dinoz.race.price;
      PlayerRepository.setPlayerMoney(player);

      // TODO: Refresh shop instead of deleting one dinoz

      // Delete choosen dinoz in dinoz shop
      await ShopRepository.deleteDinozFromShop(req.body.dinozId);

      // Create a new dinoz that belongs to player 
      let dinozCreated = await DinozRepository.create(newDinoz);

      res.send(dinozCreated.dinozId);
    // If player doesn't have enough money, terminate request
    } else {
      return res.status(501).send({
          message: "You don't have enough money to buy this dinoz"
      });
    }
  },

  // Setting dinoz name
  setDinozName: async (req, res) => {
    // Retrieve player from dinozId
    const player = await DinozRepository.getPlayerFromDinozId(req.body.dinoz.dinozId);

    // If authenticated player is different from player found, throw exception
    if (player.player.playerId !== req.user.playerId) {
      res.status(401).send({
        message: 'Unauthorized action from player : ' + req.user.playerId
      });
      return;
    }

    // Update dinoz name
    DinozRepository.setDinozName(Dinoz.build(req.body.dinoz)).then(function(response) {
      res.send(response);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while updating dinoz name'
      });
    });
  }
}

export default dinozController;