import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './app/models/index.js';
import path from 'path';
import resetDinozShop from './app/cron/resetDinozShop.js';
import dataRoutes from './app/routes/data.routes.js';
import oauthRoutes from './app/routes/oauth.routes.js';
/*import shopRoutes from './app/routes/shop.routes.js';
import playerRoutes from './app/routes/player.routes.js';
import dinozRoutes from './app/routes/dinoz.routes.js';*/

const app = express();

// Database connection
/*db.sequelize.sync().then(() => {
	console.log("Sync db");
});*/

var corsOptions = {
  origin: "http://localhost:8080"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// To send static files to client when '/data' is in URL
const dirname = path.resolve();
app.use('/api/data', express.static(dirname + '/app/data'));

// Routes declaration
dataRoutes(app);
oauthRoutes(app);
// shopRoutes(app);
// playerRoutes(app);
// dinozRoutes(app);

// Launch Cron
resetDinozShop.resetDinozShopAtMidnight();

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});