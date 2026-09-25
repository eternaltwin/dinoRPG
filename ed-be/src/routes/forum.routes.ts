import { Request, Response, Router } from 'express';
import { param, body, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';
import {
	createThread,
	getPostSource,
	getSection,
	getThread,
	replyToThread,
	updatePost
} from '../business/forumService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.forum;

routes.get(`${commonPath}/posts/:postId/source`, [param('postId').exists()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getPostSource(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.patch(
	`${commonPath}/posts/:postId`,
	[param('postId').exists(), body('content').exists(), body('comment').optional()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await updatePost(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/newThread`,
	[body('sectionId').isString().notEmpty(), body('title').exists(), body('message').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await createThread(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:threadId/reply`,
	[param('threadId').exists(), body('message').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await replyToThread(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/:page`, [param('page').exists().toInt().isNumeric()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getSection(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/sections/:sectionId/:page`,
	[param('sectionId').exists(), param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getSection(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:threadId/:page`,
	[param('threadId').exists(), param('page').exists().toInt().isNumeric()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getThread(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
