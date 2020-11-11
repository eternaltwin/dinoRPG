const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./app/models");

const app = express();

// Database connection
db.sequelize.sync().then(() => {
	console.log("Sync db");
});

var corsOptions = {
  origin: "http://localhost:8080"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// To send static files to client when '/data' is in URL
app.use('/api/data', express.static(__dirname + '/app/data'));

// Routes declaration
require("./app/routes/dinoz.routes")(app);
require("./app/routes/shop.routes")(app);
require("./app/routes/player.routes")(app);
require("./app/routes/data.routes")(app)

// Launch Cron
var resetDinozShop = require("./app/cron/resetDinozShop.js");
resetDinozShop.resetDinozShopAtMidnight();

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});