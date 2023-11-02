import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dinozRoutes from './routes/dinoz.routes.js';
import fightRoutes from './routes/fight.routes.js';
import ingredientRoutes from './routes/ingredient.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import levelRoutes from './routes/level.routes.js';
import missionsRoutes from './routes/missions.routes.js';
import newsRoutes from './routes/news.routes.js';
import npcRoutes from './routes/npc.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import playerRoutes from './routes/player.routes.js';
import shopRoutes from './routes/shop.routes.js';
import rankingRoutes from './routes/ranking.routes.js';
import { getEnvironnement, loadConfigFile } from './utils/context.js';
import { jwtConfig } from './utils/jwt.js';
import { resetDinozShopAtMidnight } from './cron/resetDinozShop.js';
import { updatePlayersPosition } from './cron/updatePlayersPosition.js';
import adminRoutes from './routes/admin.routes.js';
import 'reflect-metadata';
import { AppDataSource } from './data-source.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { sendDiscord } from './utils/discord.js';
import { swaggerOptions } from './utils/index.js';

// Surcharge les requêtes Express pour avoir le playerId dans le JWT
declare global {
	namespace Express {
		interface User {
			playerId?: number;
			isAdmin?: boolean;
		}

		interface Request {
			user?: User;
		}
	}
}

const app = express();

// Load TOML configuration file
loadConfigFile();

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Use JWT authentication to secure the API
app.use(jwtConfig());

// Routes declaration
app.use(adminRoutes);
app.use(dinozRoutes);
app.use(fightRoutes);
app.use(ingredientRoutes);
app.use(inventoryRoutes);
app.use(levelRoutes);
app.use(missionsRoutes);
app.use(newsRoutes);
app.use(npcRoutes);
app.use(oauthRoutes);
app.use(playerRoutes);
app.use(shopRoutes);
app.use(rankingRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)));

// Launch Cron
resetDinozShopAtMidnight().start();
updatePlayersPosition().start();

// Initiate controllers
//TODO: what is the purpose ?

// oauthController.init();

// set port, listen for requests
const PORT = process.env.PORT || 8081;

// Database connection
AppDataSource.initialize()
	.then(() => {
		console.log('Data Source has been initialized successfully.');
		if (getEnvironnement() !== 'development') {
			sendDiscord(`**Server started on the ${getEnvironnement()}**`).catch(e => {
				console.error(e);
			});
		}
	})
	.catch(err => console.error('Error during Data Source initialization:', err));

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
