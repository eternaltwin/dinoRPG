'use strict';

import PlayerRepository from '../repositories/player.repository.js';

const playerController = {

  // Get all dinoz from dinoz shop
  getPlayerMoney: (req, res) => {
    PlayerRepository.getMoney(req.params.id).then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while getting player money."
      });
    });
  }
}

export default playerController;