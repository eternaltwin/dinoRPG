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

// Retrieve all Dinoz from the database.
exports.findAll = (req, res) => 
  DinozRepository.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dinoz."
      });
});


// Find a single Dinoz with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Dinoz.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Dinoz with id=" + id
      });
    });
};

// Update a Dinoz by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Dinoz.update(req.body, { 
  	where: { id: id } 
  }).then(num => {
      if (num == 1) {
        res.send({
          message: "Dinoz was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Dinoz with id=${id}. Maybe Dinoz was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Dinoz with id=" + id
      });
    });
};

// Delete a Dinoz with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Dinoz.destroy({
    where: { id: id }
  }).then(num => {
      if (num == 1) {
        res.send({
          message: "Dinoz was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Dinoz with id=${id}. Maybe Dinoz was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Dinoz with id=" + id
      });
    });
};
// Delete all Dinoz from the database.
exports.deleteAll = (req, res) => {
  Dinoz.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Dinoz were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all dinoz."
      });
    });
};

// Find all frozen Dinoz
exports.findAllFrozen = (req, res) => {
  Dinoz.findAll({ where: { isFrozen: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving dinoz."
      });
    });
};

// Renvoie la fiche d'un dinoz
exports.getDinozFiche = (req, res) => {
  const id = req.params.id;
  
  DinozRepository.getDinozFiche(id).then(data => {
    var elements = {};
    // On ajoute les éléments dans un seul objet élément
    elements.nbrUpFire = data.dataValues.nbrUpFire;
    elements.nbrUpWood = data.dataValues.nbrUpWood;
    elements.nbrUpWater = data.dataValues.nbrUpWater;
    elements.nbrUpLight = data.dataValues.nbrUpLight;
    elements.nbrUpAir = data.dataValues.nbrUpAir;

    data.dataValues.elements = elements;

    // Suppression des attributs devenus inutiles
    delete data.dataValues.nbrUpFire;
    delete data.dataValues.nbrUpWood;
    delete data.dataValues.nbrUpWater;
    delete data.dataValues.nbrUpLight;
    delete data.dataValues.nbrUpAir;

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