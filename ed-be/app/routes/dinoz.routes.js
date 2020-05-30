module.exports = app => {
  const dinozs = require("../controllers/dinoz.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", dinozs.create);

  // Retrieve all Tutorials
  router.get("/", dinozs.findAll);

  // Retrieve all published Tutorials
  router.get("/frozen", dinozs.findAllFrozen);

  // Retrieve a single Tutorial with id
  router.get("/:id", dinozs.findOne);

  // Update a Tutorial with id
  router.put("/:id", dinozs.update);

  // Delete a Tutorial with id
  router.delete("/:id", dinozs.delete);

  // Create a new Tutorial
  router.delete("/", dinozs.deleteAll);

  app.use('/api/dinozs', router);
};