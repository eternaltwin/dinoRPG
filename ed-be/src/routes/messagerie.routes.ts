import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import { allValuesAreNumber } from '../utils/helpers/ValidatorHelper.js';
import sendError from '../utils/sendErrors.js';
import {
	getFullConversattion,
	getMyConversation,
	pinMesage,
	sendMessage,
	startConversation
} from '../business/messagerieService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.messagerie;

routes.get(`${commonPath}/getThreads`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getMyConversation(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/getThread/:thread`,
	[param('thread').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getFullConversattion(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/create`,
	[
		body('participants')
			.exists()
			.isArray()
			.notEmpty()
			.custom(value => allValuesAreNumber(value)),
		body('title').exists().isString(),
		body('message').exists().isString()
	],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await startConversation(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/send/:thread`,
	[param('thread').exists().isString(), body('content').exists().isString()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await sendMessage(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/pin/:thread`,
	[param('thread').exists().isString(), body('messageId').exists().isNumeric(), body('pin').exists().isBoolean()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await pinMesage(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
