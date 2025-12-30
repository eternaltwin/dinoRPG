import { Express } from 'express';
import { Config } from '../config/config.js';
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
import serverEventsRoutes from './serverEvents.routes.js';
import testingRoutes from './testing.routes.js';
import clanRoutes from './clan.routes.js';
import moderationRoutes from './moderation.routes.js';
import pantheonRoutes from './pantheon.routes.js';
import messagerieRoutes from './messagerie.routes.js';
import notificationsRoutes from './notifications.routes.js';
import dojoRoutes from './dojo.routes.js';
import forumRoutes from './forum.routes.js';
import eventsRoutes from './events.routes.js';
import dinozBuildRoutes from './dinozBuild.routes.js';
import { OAuth } from '../business/oauthService.js';
import { prisma } from '../prisma.js';
import { apiRoutes } from '../constants/index.js';
import { Result, ValidationError } from 'express-validator';

export type ErrorResponse = {
	errors: Result<ValidationError>;
};

export default function initRoutes(app: Express, config: Config) {
	// OAuth
	const oauth = new OAuth(config, prisma);
	app.get(`${apiRoutes.oauthRoute}/redirect`, oauth.redirect.bind(oauth));
	app.get(`${apiRoutes.oauthRoute}/authenticate/eternal-twin`, oauth.token.bind(oauth));

	app.use(adminRoutes);
	app.use(dinozRoutes);
	app.use(fightRoutes);
	app.use(ingredientRoutes);
	app.use(inventoryRoutes);
	app.use(levelRoutes);
	app.use(missionsRoutes);
	app.use(newsRoutes);
	app.use(npcRoutes);
	// app.use(oauthRoutes);
	app.use(playerRoutes);
	app.use(shopRoutes);
	app.use(rankingRoutes);
	app.use(offerRoutes);
	app.use(logRoutes);
	app.use(eternaltwinRoutes);
	app.use(serverEventsRoutes);
	app.use(clanRoutes);
	app.use(pantheonRoutes);
	app.use(moderationRoutes);
	app.use(messagerieRoutes);
	app.use(notificationsRoutes);
	app.use(dojoRoutes);
	app.use(forumRoutes);
	app.use(eventsRoutes);
	app.use(dinozBuildRoutes);
	if (!config.isProduction) {
		app.use(testingRoutes);
	}
}
