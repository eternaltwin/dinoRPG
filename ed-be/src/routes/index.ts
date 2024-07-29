import { Express } from 'express';
import { Config } from '../config/config.js';
import { PrismaClient } from '@drpg/prisma';
import oauthRoutes from './oauth.routes.js';
import adminRoutes from './admin.routes.js';
import dinozRoutes from './dinoz.routes.js';
import fightRoutes from './fight.routes.js';
import ingredientRoutes from './ingredient.routes.js';
import inventoryRoutes from './inventory.routes.js';
import levelRoutes from './level.routes.js';
import missionsRoutes from './missions.routes.js';
import newsRoutes from './news.routes.js';
import npcRoutes from './npc.routes.js';
import playerRoutes from './player.routes.js';
import shopRoutes from './shop.routes.js';
import rankingRoutes from './ranking.routes.js';
import offerRoutes from './offer.routes.js';
import logRoutes from './log.routes.js';
import eternaltwinRoutes from './eternaltwin.routes.js';
import webSocketRoutes from './websockets.routes.js';
import testingRoutes from './testing.routes.js';
import clanRoutes from './clan.routes.js';
import { jwtConfig } from '../utils/index.js';

export default function initRoutes(app: Express, config: Config) {
	app.use(jwtConfig());

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
	app.use(clanRoutes);
	if (!config.isProduction) {
		app.use(testingRoutes);
	}
}
