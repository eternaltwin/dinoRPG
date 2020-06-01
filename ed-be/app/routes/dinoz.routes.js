module.exports = app => {
  const dinozs = require("../controllers/dinoz.controller.js");

  var router = require("express").Router();

  // Create a new Dinoz
  router.post("/", dinozs.create);

  // Retrieve all Dinoz
  router.get("/", dinozs.findAll);

  // Retrieve all frozen Dinoz
  router.get("/frozen", dinozs.findAllFrozen);

  // Retrieve a single Dinoz with id
  router.get("/:id", dinozs.findOne);

  // Update a Dinoz with id
  router.put("/:id", dinozs.update);

  // Delete a Dinoz with id
  router.delete("/:id", dinozs.delete);

  // Create a new Dinoz
  router.delete("/", dinozs.deleteAll);

  app.use('/api/dinozs', router);
};