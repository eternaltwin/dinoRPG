import { $ForumPost } from '@eternaltwin/core/forum/forum-post';
import { $ForumSection } from '@eternaltwin/core/forum/forum-section';
import { $ForumThread } from '@eternaltwin/core/forum/forum-thread';
import { Request, Response, Router } from 'express';
import { param, body, validationResult } from 'express-validator';
import { JSON_WRITER } from 'kryo-json/json-writer';
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

// The forum service returns decoded Eternaltwin values (camelCase, `Date`, symbols), which do not
// survive `JSON.stringify`: each reply is encoded back to the Eternaltwin wire format, which the
// interface decodes with the same codecs.

routes.get(`${commonPath}/posts/:postId/source`, [param('postId').exists()], async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getPostSource(req);
		return res.status(200).type('json').send($ForumPost.write(JSON_WRITER, response));
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
			return res.status(200).type('json').send($ForumPost.write(JSON_WRITER, response));
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
			return res.status(200).type('json').send($ForumThread.write(JSON_WRITER, response));
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
			return res.status(200).type('json').send($ForumPost.write(JSON_WRITER, response));
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
		return res.status(200).type('json').send($ForumSection.write(JSON_WRITER, response));
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
			return res.status(200).type('json').send($ForumSection.write(JSON_WRITER, response));
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
			return res.status(200).type('json').send($ForumThread.write(JSON_WRITER, response));
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
