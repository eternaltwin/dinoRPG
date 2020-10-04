const ShopRepository = require("../repositories/shop.repository.js");

// Get all dinoz from dinoz shop
exports.getDinozFromDinozShop = (req, res) => {
    // Validate request
    ShopRepository.getDinozFromDinozShop(req.params.id).then(data => {

    res.send(data);

    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while getting dinoz from shop."
        });
    });
};