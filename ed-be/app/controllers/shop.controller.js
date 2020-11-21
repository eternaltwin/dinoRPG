'use strict';

const ShopRepository = require("../repositories/shop.repository.js");
const DinozController = require("../controllers/dinoz.controller.js");

// Get all dinoz from dinoz shop
exports.getDinozFromDinozShop = async (req, res) => {
    // Retrieve dinoz from dinoz shop if exists
    let data = await ShopRepository.getDinozFromDinozShop(req.params.id);

    // If nothing is found, create 15 dinoz to fill the shop
    if (data.length === 0) {

        // Get an array of 15 random dinoz
        let dinozArray = await DinozController.getDinozFromDinozShop(req.params.id);

        // Save created dinoz in database
        await ShopRepository.createMultiple(dinozArray);
        
        // Get created dinoz and their races
        ShopRepository.getDinozFromDinozShop(req.params.id).then(response => {
            res.send(response);
        });
    } else {
        res.send(data);
    }
};