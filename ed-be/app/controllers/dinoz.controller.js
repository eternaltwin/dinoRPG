const DinozRepository = require("../repositories/dinoz.repository.js");

// Create and Save a new Dinoz
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Save Dinoz in the database
  DinozRepository.create(req.body)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Dinoz."
      });
    });
};

// Renvoie la fiche d'un dinoz
exports.getDinozFiche = (req, res) => {
  const id = req.params.id;
  
  DinozRepository.getDinozFiche(id).then(data => {
    var elements = {};
    var objects = [];

    // On ajoute les éléments dans un seul objet élément
    elements.fire = data.dataValues.nbrUpFire;
    elements.wood = data.dataValues.nbrUpWood;
    elements.water = data.dataValues.nbrUpWater;
    elements.light = data.dataValues.nbrUpLight;
    elements.air = data.dataValues.nbrUpAir;

    data.dataValues.elements = elements;

    // Suppression des attributs devenus inutiles
    delete data.dataValues.nbrUpFire;
    delete data.dataValues.nbrUpWood;
    delete data.dataValues.nbrUpWater;
    delete data.dataValues.nbrUpLight;
    delete data.dataValues.nbrUpAir;


    // On récupère les objets qu'à le dinoz sous une seule variable 'object'
    data.assDinozObject.forEach(assDinozObject => {
      objects.push(assDinozObject.object);
    });

    data.dataValues.objects = objects;

    delete data.dataValues.assDinozObject;

    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving dinoz data."
    });
  });
};

// Get all dinoz not frozen from one player
exports.getDinozPlayer = (req, res) => {
  const id = req.params.id;

  DinozRepository.getDinozPlayer(id).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving dinoz from player. Id player = " + id
    });
  });
}