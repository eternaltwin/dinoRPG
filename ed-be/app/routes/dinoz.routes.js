module.exports = app => {
  const dinoz = require("../controllers/dinoz.controller.js");

  var router = require("express").Router();

  // Create a new Dinoz
  router.post("/", dinoz.create);

  // Retrieve all Dinoz
  router.get("/", dinoz.findAll);

  // Retrieve all frozen Dinoz
  router.get("/frozen", dinoz.findAllFrozen);

  // Retrieve a single Dinoz with id
  router.get("/:id", dinoz.findOne);

  // Update a Dinoz with id
  router.put("/:id", dinoz.update);

  // Delete a Dinoz with id
  router.delete("/:id", dinoz.delete);

  // Create a new Dinoz
  router.delete("/", dinoz.deleteAll);

  app.use('/api/dinoz', router);
};