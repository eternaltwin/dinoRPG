import express = require('express');

import bodyParser from 'body-parser';
import cors from 'cors';
import 'reflect-metadata';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { resetDinozShopAtMidnight } from './cron/resetDinozShop.js';
import adminRoutes from './routes/admin.routes.js';
import dinozRoutes from './routes/dinoz.routes.js';
import fightRoutes from './routes/fight.routes.js';
import ingredientRoutes from './routes/ingredient.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import levelRoutes from './routes/level.routes.js';
import logRoutes from './routes/log.routes.js';
import missionsRoutes from './routes/missions.routes.js';
import newsRoutes from './routes/news.routes.js';
import npcRoutes from './routes/npc.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import offerRoutes from './routes/offer.routes.js';
import playerRoutes from './routes/player.routes.js';
import rankingRoutes from './routes/ranking.routes.js';
import shopRoutes from './routes/shop.routes.js';
import webSocketRoutes from './routes/websockets.routes.js';
import eternaltwinRoutes from './routes/eternaltwin.routes.js';
import { swaggerOptions } from './utils/index.js';
import { jwtConfig } from './utils/jwt.js';
import { loadConfig } from './config/config.js';
import { scheduleOffersExpiration } from './business/offerService.js';
import http, { IncomingMessage } from 'http';
import {
	checkIfClientsAreAlive,
	connectUserToChannel,
	disconnectUser,
	processIncomingMessage,
	setConnectionToAlive
} from './business/webSocketService.js';
import { RawData, WebSocketServer } from 'ws';
import { WebSocketCustom } from '@drpg/core/models/webSocket/WebSocketCustom';
import { WebSocketServerCustom } from '@drpg/core/models/webSocket/WebSocketServerCustom';
import testingRoutes from './routes/testing.routes.js';
import { healRestingDinoz } from './cron/healRestingDinoz.js';
import { healDinozFount } from './cron/healDinozFount.js';
import { itinerantMerchant } from './cron/itinerantMerchant.js';
import { GLOBAL, ServerContext } from './context.js';
import { readyCheck } from './middleware/readyCheck.js';
import initRoutes from './routes/index.js';
import lockMiddleware from './middleware/lock.js';

// Surcharge les requêtes Express pour avoir le playerId dans le JWT
declare global {
	namespace Express {
		interface User {
			playerId?: number;
			isAdmin?: boolean;
		}

		interface Request {
			auth?: User;
		}
	}
}

// Load TOML configuration file
// loadConfigFile();

/*
export function test(cx: ServerContext) {
	const app = express();
	const config = loadConfig();
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
	app.use(offerRoutes);
	app.use(logRoutes);
	app.use(eternaltwinRoutes);
	app.use(webSocketRoutes);
	if (!config.isProduction) {
		app.use(testingRoutes);
	}

	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)));

	// Launch Cron
	resetDinozShopAtMidnight().start();
	healRestingDinoz().start();
	healDinozFount().start();
	itinerantMerchant().start();

	scheduleOffersExpiration();

	// set port, listen for requests
	const PORT = cx.config.port;

	const server = http.createServer(app);

	const wss = new WebSocketServer({ server });

	server.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));

	wss.on('connection', (ws: WebSocketCustom, req: IncomingMessage) => {
		try {
			connectUserToChannel(ws, req);
		} catch (err) {
			ws.close();
		}

		ws.on('message', (data: RawData) => processIncomingMessage(wss as WebSocketServerCustom, ws.id, data));

		ws.on('close', () => disconnectUser(ws));

		ws.on('pong', () => setConnectionToAlive(ws));

		ws.on('error', console.error);
	});

	const interval = setInterval(() => checkIfClientsAreAlive(wss as WebSocketServerCustom), 30000);

	wss.on('close', () => clearInterval(interval));
}
*/

export function main(cx: ServerContext) {
	cx.logger.log(`Server started`);

	const app = express();
	const { port } = cx.config;

	app.use(cors());
	app.use(bodyParser.json());
	app.use(
		bodyParser.urlencoded({
			extended: true
		})
	);
	app.use(lockMiddleware);
	app.use(readyCheck);

	app.listen(port, () => {
		cx.logger.info(`Server listening on port ${port}`);

		/*// Trigger daily job
		dailyJob(cx.prisma)().catch((error: Error) => {
			cx.discord.sendError(error);
		});

		// Initialize daily scheduler
		schedule.scheduleJob('0 0 * * *', dailyJob(cx.prisma));

		// Start worker queue
		startJob(cx.prisma).catch((error: Error) => {
			cx.discord.sendError(error);
		});*/
	});

	resetDinozShopAtMidnight().start();
	healRestingDinoz().start();
	healDinozFount().start();
	itinerantMerchant().start();

	scheduleOffersExpiration();

	initRoutes(app, cx.config);
}

/**
 * Initialize the global context, then run `main`
 */
export function mainWrapper() {
	// Note: We don't dispose the global context since the server is expected to
	// run forever
	main(GLOBAL);
}
