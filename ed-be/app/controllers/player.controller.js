'use strict';

import PlayerRepository from '../repositories/player.repository.js';

const playerController = {

  // Get all player money
  getPlayerMoney: async (req, res) => {
    const money = await PlayerRepository.getMoney(req.params.id);
    res.status(200).send(money);
  }
}

export default playerController;