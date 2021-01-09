'use strict';

import ShopRepository from '../repositories/shop.repository.js';
import DinozRaceRepository from '../repositories/dinozRace.respository.js';
import PlayerRepository from '../repositories/player.repository.js';
import Constants from '../utils/constants.js';
import context from '../utils/context.js';
import _ from 'lodash';
import db from '../models/index.js';

const Dinoz = db.dinoz;

const shopController = {
    // Get all dinoz from dinoz shop
    getDinozFromDinozShop: async (req, res) => {
        // Retrieve dinoz from dinoz shop if exists
        let data = await ShopRepository.getDinozFromDinozShop(req.user.playerId);

        // If nothing is found, create 15 dinoz to fill the shop
        if (_.isEmpty(data)) {

            let dinoz = {};
            let dinozArray = [];
            let raceArray = [Constants.dinozRace.winks, Constants.dinozRace.sirain, Constants.dinozRace.castivore, Constants.dinozRace.nuagoz, 
                Constants.dinozRace.gorilloz, Constants.dinozRace.wanwan, Constants.dinozRace.pigmou, Constants.dinozRace.planaille, Constants.dinozRace.moueffe];
            let randomRace;
            let randomDisplay;
            const rewardArray = [Constants.reward.tropheeHippoclamp, Constants.reward.tropheePteroz, Constants.reward.tropheeRocky, Constants.reward.tropheeQuetzu];
            const config = context.getConfig();

            // Check if player has rocky, pteroz or hippoclamp trophy
            const player = await PlayerRepository.getRewardFromArray(req.user.playerId, rewardArray);
                
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
                if (reward.name === Constants.reward.tropheeQuetzu && player.quetzuBought < config.shop.buyableQuetzu) {
                    raceArray.push(Constants.dinozRace.quetzu);
                }
            });
            // Get all buyable races from a dinoz array
            let races = await DinozRaceRepository.getRaceFromArray(raceArray);

            for (var i = 0; i < config.shop.dinozInShop; i ++){

                // Set a random race to the dinoz
                randomRace = getRandomNumber(1, races.length);
                // Set a random display to the dinoz
                randomDisplay = races[randomRace].swfLetter + '0' + getCosmetique() + '000';

                dinoz = Dinoz.build({
                    playerId: parseInt(req.user.playerId),
                    raceId: races[randomRace].raceId,
                    display: randomDisplay
                });

                dinozArray.push(dinoz.dataValues);

                // Don't authorize quetzu selling if player have already reached the limit 
                if (races[randomRace].name === Constants.dinozRace.quetzu) {
                    player.quetzuBought++;
                    if (player.quetzuBought === config.shop.buyableQuetzu) {
                        // Remove Quetzu from buyable races
                        _.remove(races, function(race){
                            return race.name === Constants.dinozRace.quetzu;
                        });
                    }
                }
            }

            // Save created dinoz in database
            await ShopRepository.createMultiple(dinozArray);
            
            // Get created dinoz and their races
            let response = await ShopRepository.getDinozFromDinozShop(req.user.playerId)
            
            response = _.orderBy(response, ['id', 'desc']);

            return res.status(200).send(response);
        } else {
            data = _.orderBy(data, ['id', 'desc']);

            return res.status(200).send(data);
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
