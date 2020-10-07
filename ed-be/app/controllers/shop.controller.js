const ShopRepository = require("../repositories/shop.repository.js");

// Get all dinoz from dinoz shop
exports.getDinozFromDinozShop = (req, res) => {
    // Retrieve dinoz from dinoz shop if exists
    ShopRepository.getDinozFromDinozShop(req.params.id).then(data => {

    // If nothing is found, create 30 dinoz to fill the shop
    if (data.length === 0){

        var dinoz = {};
        var buyableRace = 12;
        var randomRace;
        var dinozArray = [];

        for (var i = 0; i < 15; i ++){
            // Dinoz has a random race
            randomRace = Math.floor(Math.random() * Math.floor(buyableRace)) + 1;

            dinoz = {
                playerId: parseInt(req.params.id),
                raceId: randomRace,
                display: Math.random().toString(36).substring(7)
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