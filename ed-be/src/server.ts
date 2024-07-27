import express = require('express');

import bodyParser from 'body-parser';
import cors from 'cors';
import 'reflect-metadata';
import { resetDinozShopAtMidnight } from './cron/resetDinozShop.js';
import { scheduleOffersExpiration } from './business/offerService.js';
import { healRestingDinoz } from './cron/healRestingDinoz.js';
import { healDinozFount } from './cron/healDinozFount.js';
import { itinerantMerchant } from './cron/itinerantMerchant.js';
import { GLOBAL, ServerContext } from './context.js';
import { readyCheck } from './middleware/readyCheck.js';
import initRoutes from './routes/index.js';
import lockMiddleware from './middleware/lock.js';
import './i18n.js';

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
