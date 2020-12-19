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
  getDinozFiche: (req, res) => {
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
  },

  // Get all dinoz not frozen from one player
  getDinozPlayer: (req, res) => {
    DinozRepository.getDinozPlayer(req.params.id).then(data => {
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
    var player = await PlayerRepository.getMoney(parseInt(req.body.playerId));

    if (parseInt(player.money) > req.body.dinoz.race.price) {
      var dinoz = {
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

      // Delete choosen dinoz in dinoz shop
      ShopRepository.deleteDinozFromShop(req.body.dinoz.id);

      // Create new dinoz in database
      let dinozCreated = await DinozRepository.create(dinoz);
      res.send(dinozCreated.dinozId);
    } else {
      return res.status(501).send({
          message: "You don't have enough money to buy this dinoz"
      });
    }
  },

  // Setting dinoz name
  setDinozName: (req, res) => {
    DinozRepository.setDinozName(Dinoz.build(req.body.dinoz)).then(function(response) {
      res.send(response);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while updating dinoz name"
      });
    });;
  }
}

export default dinozController;