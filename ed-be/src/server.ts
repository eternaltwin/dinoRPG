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

// Database connection
AppDataSource.initialize()
	.then(() => {
		console.log('Data Source has been initialized successfully.');
	})
	.catch(err => {
		console.error('Error during Data Source initialization:', err);
	});

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

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'API REST de EternalDinoRPG',
		description: "Yep, it's the API",
		version: '1.0.0'
	},
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT'
			}
		}
	},
	servers: [
		{
			url: process.env.NODE_ENV === 'development' ? 'http://localhost:8081' : 'https://dinorpg.eternaltwin.org'
		}
	],
	tags: [
		{
			name: 'Oauth',
			description: 'Request made for authenticate the player'
		},
		{
			name: 'Dinoz',
			description: 'Requests made about the dinoz'
		},
		{
			name: 'Player',
			description: 'Requests made about the player'
		},
		{
			name: 'Shop',
			description: 'Requests made about the shops'
		},
		{
			name: 'Ingredients',
			description: 'Requests made about the ingredient'
		},
		{
			name: 'Inventory',
			description: "Requests made about the player's inventory"
		},
		{
			name: 'Level',
			description: 'Requests made about the dinoz leveling'
		},
		{
			name: 'News',
			description: 'Requests made about the news of the website'
		},
		{
			name: 'Ranking',
			description: 'Requests made about the ranking'
		},
		{
			name: 'Admin',
			description: 'Requests requiring to be administrator'
		}
	]
};
const swaggerOptions = {
	swaggerDefinition,
	apis: ['dist/routes/*.js']
};
import swaggerJsDoc from 'swagger-jsdoc';
import { sendDiscord } from './utils/discord.js';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)));

// Launch Cron
resetDinozShopAtMidnight().start();
updatePlayersPosition().start();

// Initiate controllers
//TODO: what is the purpose ?

// oauthController.init();

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
	if (getEnvironnement() !== 'development') {
		sendDiscord(`**Server started**`).catch(e => {
			console.error(e);
		});
	}
});
