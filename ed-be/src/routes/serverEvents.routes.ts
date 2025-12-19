import { Request, Response, Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { authenticate, connectUserToSseChannel, disconnectSseUser } from '../business/serverEventService.js';
import { body, header, validationResult } from 'express-validator';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { ServerEventType } from '@drpg/core/models/serverEvents/ServerEventType';
import sendError from '../utils/sendErrors.js';
import { GLOBAL } from '../context.js';
import { SseDataEnum } from '@drpg/core/models/serverEvents/SseData';

const routes: Router = Router();

const commonPath: string = apiRoutes.serverEventsRoute;

routes.post(
	`${commonPath}/websockets/authenticate`,
	[header('user-agent').exists(), body('channel').exists().isIn(Object.values(WsChannel))],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const ticket = await authenticate(req, ServerEventType.WEBSOCKET);
			return res.status(200).send(ticket);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/sse/authenticate`,
	[header('user-agent').exists(), body('channel').exists().isIn(Object.values(SseChannel))],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}
		try {
			const ticket = await authenticate(req, ServerEventType.SSE);
			return res.status(200).send(ticket);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/events`, async (req: Request, res: Response) => {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	// To keep the connection alive
	res.flushHeaders();

	const sendUpdate = () => {
		if (!res.writableEnded) {
			const data = JSON.stringify({ type: SseDataEnum.LIVE_STATS, live_stats: GLOBAL.liveStats.summary });
			res.write(`data: ${data}\n\n`);
		}
	};

	sendUpdate();

	// Heartbeat / Update périodique (toutes les 30s)
	const keepAlive = setInterval(sendUpdate, 30000);

	try {
		await connectUserToSseChannel(req, res);

		req.on('close', () => {
			clearInterval(keepAlive);
			disconnectSseUser(req);
		});
	} catch (err) {
		clearInterval(keepAlive);
		sendError(res, err);
	}
});

export default routes;
