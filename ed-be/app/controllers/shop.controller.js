const ShopRepository = require("../repositories/shop.repository.js");

// Get all dinoz from dinoz shop
exports.getDinozFromDinozShop = (req, res) => {
    // Retrieve dinoz from dinoz shop if exists
    ShopRepository.getDinozFromDinozShop(req.params.id).then(data => {

    // If nothing is found, create 15 dinoz to fill the shop
    if (data.length === 0){

        var dinoz = {};
        var buyableRace = 12;
        var randomRace;
        var dinozArray = [];

        for (var i = 0; i < 15; i ++){
            // Dinoz has a random race
            randomRace = Math.floor(Math.random() * Math.floor(buyableRace)) + 1;
            randomDisplay = getRandomRace() + '0' + getCosmetique() + '000';

            dinoz = {
                playerId: parseInt(req.params.id),
                raceId: randomRace,
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

// Return a random race (first letter of data param)
function getRandomRace() {
    var randomRace = undefined;
    while((randomRace > 57 && randomRace < 65) || randomRace === undefined) {
        randomRace = getRandomNumber(48, 67);
    }
    return String.fromCharCode(randomRace);
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