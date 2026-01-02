import express from 'express';

import bodyParser from 'body-parser';
import cors from 'cors';
import 'reflect-metadata';
import { scheduleEndedOffersExpiration, scheduleOffersExpiration } from './business/offerService.js';
import { itinerantMerchant } from './cron/itinerantMerchant.js';
import { GLOBAL, ServerContext } from './context.js';
import { readyCheck } from './middleware/readyCheck.js';
import initRoutes from './routes/index.js';
import lockMiddleware from './middleware/lock.js';
import './i18n.js';

import {
	checkIfWsClientsAreAlive,
	connectUserToWsChannel,
	disconnectWsUser,
	processWsIncomingMessage,
	setWsConnectionToAlive
} from './business/serverEventService.js';
import { RawData, WebSocketServer } from 'ws';
import { WebSocketCustom } from '@drpg/core/models/serverEvents/WebSocketCustom';
import { WebSocketServerCustom } from '@drpg/core/models/serverEvents/WebSocketServerCustom';
import { IncomingMessage } from 'http';
import { checkBans } from './cron/checkBans.js';
import TournamentManager from './utils/tournamentManager.js';
import { prisma } from './prisma.js';
import { resumeTournaments } from './business/forceBruteService.js';
import { scheduleAtStart } from './business/scheduleService.js';
import { schedulePollExpiration } from './business/newsService.js';

// Surcharge les requêtes Express pour avoir le playerId dans le JWT
declare global {
	namespace Express {
		interface User {
			playerId?: string;
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
	const { port, wssPort } = cx.config;

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

		const wss = new WebSocketServer({ port: wssPort });
		handleWsEvents(wss);

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

	scheduleAtStart();
	itinerantMerchant().start();
	checkBans().start();

	scheduleOffersExpiration();
	scheduleEndedOffersExpiration();
	schedulePollExpiration();
	TournamentManager.resume(prisma);
	resumeTournaments();

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

function handleWsEvents(wss: WebSocketServer) {
	wss.on('connection', async (ws: WebSocketCustom, req: IncomingMessage) => {
		try {
			await connectUserToWsChannel(ws, req);
		} catch (err) {
			ws.close();
		}

		ws.on('message', async (data: RawData) => {
			try {
				await processWsIncomingMessage(wss as WebSocketServerCustom, ws.id, data);
			} catch (err) {
				console.error(err);
				disconnectWsUser(ws);
				ws.close();
			}
		});

		ws.on('close', () => {
			try {
				disconnectWsUser(ws);
			} catch (err) {
				console.error('Cannot close ws connection.', err);
			}
		});

		ws.on('pong', () => setWsConnectionToAlive(ws));

		ws.on('error', () => disconnectWsUser(ws));
	});

	const interval = setInterval(() => checkIfWsClientsAreAlive(wss as WebSocketServerCustom), 30000);

	wss.on('close', () => clearInterval(interval));
}
