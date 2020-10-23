const ShopRepository = require("../repositories/shop.repository.js");
const DinozRaceRespository = require("../repositories/dinozRace.respository.js");

// Get all dinoz from dinoz shop
exports.getDinozFromDinozShop = (req, res) => {
    // Retrieve dinoz from dinoz shop if exists
    ShopRepository.getDinozFromDinozShop(req.params.id).then(data => {

    // If nothing is found, create 15 dinoz to fill the shop
    if (data.length === 0){

        var dinoz = {};
        var dinozArray = [];
        var raceArray = ['winks', 'sirain', 'castivore', 'nuagoz', 'gorilloz', 'wanwan', 'pigmou', 'planaille', 'moueffe'];
        var randomRace;

        // Check if player has rocky, pteroz or hippoclamp trophy
        // TODO

        // Get all buyable races from a dinoz array
        DinozRaceRespository.getRaceFromArray(raceArray).then(function(races) {
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
            ShopRepository.createMultiple(dinozArray).then(resp => {
                // Get created dinoz and their races
                ShopRepository.getDinozFromDinozShop(req.params.id).then(response => {
                    res.send(response);
                });
            });
        });
    } else {
        res.send(data);
    }

    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while getting dinoz from shop."
        });
    });
};

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