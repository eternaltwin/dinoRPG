const ShopRepository = require("../repositories/shop.repository.js");

// Get all dinoz from dinoz shop
exports.getDinozFromDinozShop = (req, res) => {
    // Retrieve dinoz from dinoz shop if exists
    ShopRepository.getDinozFromDinozShop(req.params.id).then(data => {

    // If nothing is found, create 30 dinoz to fill the shop
    if (data.length === 0){

        var dinoz = {};
        var raceNumber = 21;
        var randomRace;
        var dinozArray = [];

        for (var i = 0; i < 30; i ++){
            // Dinoz has a random race
            randomRace = Math.floor(Math.random() * Math.floor(2)) + 1;

            dinoz = {
                playerId: parseInt(req.params.id),
                raceId: randomRace,
                display: Math.random().toString(36).substring(7)
            }

            dinozArray.push(dinoz);
        }

        ShopRepository.createMultiple(dinozArray);

        res.send(dinozArray);

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