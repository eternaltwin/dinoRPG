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

    // If player found is different from player who do the request, throw exception
    if (player.player.playerId !== req.user.playerId) {
      return res.status(401).send({
        message: 'Cannot get dinoz details, dinozId : ' + dinozId + ', playerId : ' + req.user.playerId
      });
    }

    const dinozDetails = await DinozRepository.getDinozFiche(dinozId);

    res.status(200).send(dinozDetails);
  },

  // Get all dinoz not frozen from one player
  getDinozPlayer: async(req, res) => {
    try {
      const data = await DinozRepository.getDinozPlayer(req.user.playerId)
      return res.status(200).send(data);
    } catch(err) {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dinoz from player. Id player = " + id
      });
    }
  },

  buyDinoz: async (req, res) => {
    // Check if player has enough money to buy this dinoz
    const player = await PlayerRepository.getMoney(parseInt(req.user.playerId));

    // Get dinoz details from dinozId
    const dinoz = await ShopRepository.getDinozDetails(req.body.dinozId);

    // Throw unauthorized error if dinoz doesn't belong to player shop
    if (dinoz.player.playerId !== req.user.playerId) {
      return res.status(401).send({
        message: 'Unauthorized action, you can\'t buy this dinoz'
      });
    }

    // TODO: add skill to dinoz
    if (parseInt(player.money) > dinoz.race.price) {
    
      const newDinoz = Dinoz.build({ 
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
      });

      // Set player money
      player.money = parseInt(player.money) - dinoz.race.price;
      await PlayerRepository.setPlayerMoney(player);

      // Delete all dinoz from dinoz shop
      await ShopRepository.deleteDinozInShop(req.user.playerId);

      // Create a new dinoz that belongs to player 
      const dinozCreated = await DinozRepository.create(newDinoz.dataValues);

      return res.status(200).send(dinozCreated.dinozId);
    } else {
      // If player doesn't have enough money, terminate request
      return res.status(500).send({
          message: 'You don\'t have enough money to buy this dinoz'
      });
    }
  },

  // Setting dinoz name
  setDinozName: async (req, res) => {
    // Retrieve player from dinozId
    const player = await DinozRepository.getPlayerFromDinozId(req.body.dinoz.dinozId);

    // If authenticated player is different from player found, throw exception
    if (player.player.playerId !== req.user.playerId) {
      return res.status(401).send({
        message: 'Unauthorized action from player : ' + req.user.playerId
      });
    }

    // Update dinoz name
    try {
      const response = await DinozRepository.setDinozName(Dinoz.build(req.body.dinoz))
      return res.status(200).send(response);
    } catch(err) {
      return res.status(500).send({
        message:
          err.message || 'Some error occurred while updating dinoz name'
      });
    }
  }
}

export default dinozController;