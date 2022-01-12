import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dinozRoutes from './routes/dinoz.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import playerRoutes from './routes/player.routes.js';
import shopRoutes from './routes/shop.routes.js';
import { loadConfigFile } from './utils/context.js';
import { jwtConfig } from './utils/jwt.js';
import { resetDinozShopAtMidnight } from './cron/resetDinozShop.js';
import { sequelize } from './sequelize.js';

// Surcharge les requêtes Express pour avoir le playerId dans le JWT
declare global {
	namespace Express {
		interface User {
			playerId?: number;
		}

		interface Request {
			user?: User;
		}
	}
}

const app = express();

// Load TOML configuration file
loadConfigFile();

// Database connection
// { alter: true } -> Si besoin
// { force: true } -> S'il n'y a plus d'espoir
sequelize
	.sync()
	.then(() => {
		console.log('Database sync');
	})
	.catch(() => {
		console.error('Error while doing database synchronisation');
	});

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Use JWT authentication to secure the API
app.use(jwtConfig());

// Routes declaration
app.use(dinozRoutes);
app.use(inventoryRoutes);
app.use(oauthRoutes);
app.use(playerRoutes);
app.use(shopRoutes);

// Launch Cron
resetDinozShopAtMidnight().start();

// Initiate controllers
// oauthController.init();

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
