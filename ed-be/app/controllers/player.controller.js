'use strict';

const PlayerRepository = require("../repositories/player.repository.js");

// Get all dinoz from dinoz shop
exports.getPlayerMoney = (req, res) => {
    PlayerRepository.getMoney(req.params.id).then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while getting player money."
      });
    });
};