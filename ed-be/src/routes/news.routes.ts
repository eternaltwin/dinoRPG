import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import {
	createPoll,
	getNews,
	getNewsIllustration,
	postNews,
	selectPollOption,
	updateNews,
	toggleLikeNews,
	getAllNews,
	deleteNews,
	getNewsAdmin
} from '../business/newsService.js';
import { apiRoutes } from '../constants/index.js';
import { checkRole } from '../utils/server/jwt.js';
import sendError from '../utils/server/sendErrors.js';
import { AdminRole } from '@drpg/prisma';

const routes: Router = Router();

const commonPath: string = apiRoutes.newsRoute;

routes.put(
	`${commonPath}/create/:title`,
	[
		multer().single('file'),
		param('title').exists().isString(),
		body('frenchText').default(null).optional({ nullable: true }).exists().isString(),
		body('englishText').default(null).optional({ nullable: true }).exists().isString(),
		body('spanishText').default(null).optional({ nullable: true }).exists().isString(),
		body('germanText').default(null).optional({ nullable: true }).exists().isString(),
		body('frenchTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('englishTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('spanishTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('germanTitle').default(null).optional({ nullable: true }).exists().isString()
	],
	checkRole([AdminRole.ADMIN, AdminRole.AMPHI]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const news = await postNews(req);
			return res.status(200).send(news);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/createPoll/:title`,
	[
		multer().single('file'),
		param('title').exists().isString(),
		body('frenchText').default(null).optional({ nullable: true }).exists().isString(),
		body('englishText').default(null).optional({ nullable: true }).exists().isString(),
		body('spanishText').default(null).optional({ nullable: true }).exists().isString(),
		body('germanText').default(null).optional({ nullable: true }).exists().isString(),
		body('frenchTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('englishTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('spanishTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('germanTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('options').exists(),
		body('endDate').default(null).optional({ nullable: true }).exists().isDate()
	],
	checkRole([AdminRole.ADMIN, AdminRole.AMPHI]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await createPoll(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(`${commonPath}/page/:page`, param('page').exists().toInt().isInt(), async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await getNews(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(`${commonPath}/all`, checkRole([AdminRole.ADMIN, AdminRole.AMPHI]), async (req: Request, res: Response) => {
	try {
		const response = await getAllNews();
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.get(
	`${commonPath}/:id`,
	checkRole([AdminRole.ADMIN, AdminRole.AMPHI]),
	param('id').exists().toInt().isInt(),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await getNewsAdmin(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/update/:id`,
	[
		multer().single('file'),
		param('id').exists().toInt().isInt(),
		body('frenchText').default(null).optional({ nullable: true }).exists().isString(),
		body('englishText').default(null).optional({ nullable: true }).exists().isString(),
		body('spanishText').default(null).optional({ nullable: true }).exists().isString(),
		body('germanText').default(null).optional({ nullable: true }).exists().isString(),
		body('frenchTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('englishTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('spanishTitle').default(null).optional({ nullable: true }).exists().isString(),
		body('germanTitle').default(null).optional({ nullable: true }).exists().isString()
	],
	checkRole([AdminRole.ADMIN, AdminRole.AMPHI]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await updateNews(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(
	`${commonPath}/delete/:id`,
	param('id').exists().toInt().isInt(),
	checkRole([AdminRole.ADMIN]),
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await deleteNews(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/poll/:id/:option`,
	[param('id').exists().toInt().isInt(), param('option').exists().toInt().isInt()],
	async (req: Request<{ id: string }>, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await selectPollOption(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/:id/illustration`,
	param('id').exists().toInt().isInt(),
	async (req: Request<{ id: string }>, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const illustration = await getNewsIllustration(req);
			if (illustration) {
				return res.status(200).contentType('image/webp').send(Buffer.from(illustration));
			}
			return res.status(200).contentType('image/webp').send(illustration);
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(`${commonPath}/:id/like`, param('id').exists().toInt().isInt(), async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const result = await toggleLikeNews(req);
		return res.status(200).send(result);
	} catch (err) {
		sendError(res, err);
	}
});

export default routes;
