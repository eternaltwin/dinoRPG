import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import dinozRoutes from './routes/dinoz.routes.js';
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
//loadConfigFile();

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

/*const corsOptions = {
	origin: ['http://localhost:8080'],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// To send static files to client when '/data' is in URL
const dirname = path.resolve();
app.use('/api/data', express.static(dirname + '/src/data'));

// Use JWT authentication to secure the API
app.use(jwtConfig());

// Routes declaration
app.use(dinozRoutes);
app.use(oauthRoutes);
app.use(playerRoutes);
app.use(shopRoutes);

// Launch Cron
resetDinozShopAtMidnight();

// Initiate controllers
// oauthController.init();*/

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
