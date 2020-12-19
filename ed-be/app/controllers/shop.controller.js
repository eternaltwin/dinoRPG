'use strict';

import ShopRepository from '../repositories/shop.repository.js';
import DinozRaceRepository from '../repositories/dinozRace.respository.js';
import PlayerRepository from '../repositories/player.repository.js';
import Constants from '../utils/constants.js';

const shopController = {
    // Get all dinoz from dinoz shop
    getDinozFromDinozShop: async (req, res) => {
        // Retrieve dinoz from dinoz shop if exists
        let data = await ShopRepository.getDinozFromDinozShop(req.params.id);

        // If nothing is found, create 15 dinoz to fill the shop
        if (data.length === 0) {

            let dinoz = {};
            let dinozArray = [];
            let raceArray = [Constants.dinozRace.winks, Constants.dinozRace.sirain, Constants.dinozRace.castivore, Constants.dinozRace.nuagoz, 
                Constants.dinozRace.gorilloz, Constants.dinozRace.wanwan, Constants.dinozRace.pigmou, Constants.dinozRace.planaille, Constants.dinozRace.moueffe];
            let randomRace;
            let randomDisplay;
            let rewardArray = [Constants.reward.tropheeHippoclamp, Constants.reward.tropheePteroz, Constants.reward.tropheeRocky];

            // Check if player has rocky, pteroz or hippoclamp trophy
            let player = await PlayerRepository.getRewardFromArray(req.params.id, rewardArray);
                
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

            for (var i = 0; i < 15; i ++){
                // Set a random race to the dinoz
                randomRace = getRandomNumber(1, races.length);
                // Set a random display to the dinoz
                randomDisplay = races[randomRace].swfLetter + '0' + getCosmetique() + '000';

                // Create dinoz
                dinoz = {
                    playerId: parseInt(req.params.id),
                    raceId: races[randomRace].raceId,
                    display: randomDisplay
                }

                dinozArray.push(dinoz);
            }

            // Save created dinoz in database
            await ShopRepository.createMultiple(dinozArray);
            
            // Get created dinoz and their races
            ShopRepository.getDinozFromDinozShop(req.params.id).then(response => {
                res.send(response);
            });
        } else {
            res.send(data);
        }
    }
}

// Return a String with a length of 11
function getCosmetique() {
    var params = {
        includeUpperCase: true,
        includeNumbers: true,
        length: 11
    }
    return strRandom(params);
}

// Generate random number or letter
function strRandom(o) {
    var a = 10,
        b = 'abcdefghijklmnopqrstuvwxyz',
        c = '',
        d = 0,
        e = ''+b;
    if (o) {
      if (o.startsWithLowerCase) {
        c = b[Math.floor(Math.random() * b.length)];
        d = 1;
      }
      if (o.length) {
        a = o.length;
      }
      if (o.includeUpperCase) {
        e += b.toUpperCase();
      }
      if (o.includeNumbers) {
        e += '1234567890';
      }
    }
    for (; d < a; d++) {
      c += e[Math.floor(Math.random() * e.length)];
    }
    return c;
  }

// Return a random number [min, max[
function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export default shopController;