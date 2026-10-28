import { readUserStoreEvent } from '@eternaltwin/core/user/user-store-event';
import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import { checkPlayerLB } from '../business/eternaltwinService.js';
import { handleEternaltwinEvent, isEternaltwinAuthorization } from '../business/eternaltwinEventService.js';
import { LOGGER } from '../context.js';
import sendError from '../utils/server/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.eternalTwinRoute;

// Webhook Eternaltwin posts user events to (`event_stream_uri` of the app seed).
routes.post(apiRoutes.eternalTwinEventsRoute, (req: Request, res: Response) => {
	if (!isEternaltwinAuthorization(req.get('authorization'))) {
		return res.sendStatus(401);
	}
	const event = readUserStoreEvent(req.body);
	// Unknown kinds and invalid bodies are acknowledged too: they are not errors to Eternaltwin.
	res.sendStatus(204);
	if (event !== null) {
		handleEternaltwinEvent(event).catch((error: unknown) =>
			LOGGER.error(`Eternaltwin event ${event.event.description} ${event.id} failed: ${error}`)
		);
	}
});

routes.get(`${commonPath}/:uuid`, [param('uuid').exists().isString()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await checkPlayerLB(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
