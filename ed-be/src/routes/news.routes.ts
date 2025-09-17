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
	toggleLikeNews
} from '../business/newsService.js';
import { apiRoutes } from '../constants/index.js';
import { checkIsAdmin } from '../utils/jwt.js';
import sendError from '../utils/sendErrors.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.newsRoute;

/**
 * @openapi
 * /api/v1/news/create/{title}:
 *   put:
 *     summary: Create a news
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *       - News
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: title
 *         type: string
 *         required: true
 *         description: Name of the new
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             frenchText:
 *               type: string
 *               description: French text of the news
 *             englishText:
 *               type: number
 *               description: English text of the news
 *             spanishText:
 *               type: string
 *               description: Spanish text of the news
 *             germanText:
 *               type: number
 *               description: German text of the news
 *             frenchTitle:
 *               type: string
 *               description: French title of the news
 *             englishTitle:
 *               type: number
 *               description: English title of the news
 *             spanishTitle:
 *               type: string
 *               description: Spanish title of the news
 *             germanTitle:
 *               type: number
 *               description: German title of the news
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
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
	checkIsAdmin,
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			await postNews(req);
			return res.status(200).send();
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
		body('options').exists()
	],
	checkIsAdmin,
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

/**
 * @openapi
 * /api/v1/news/page/{page}:
 *   get:
 *     summary: Get a batch of news
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - News
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: page
 *         type: string
 *         required: true
 *         description: Number of  the page to display
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
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

/**
 * @openapi
 * /api/v1/news/update/{title}:
 *   put:
 *     summary: Create a news
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *       - News
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: title
 *         type: string
 *         required: true
 *         description: Name of the new
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             frenchText:
 *               type: string
 *               description: French text of the news
 *             englishText:
 *               type: number
 *               description: English text of the news
 *             spanishText:
 *               type: string
 *               description: Spanish text of the news
 *             germanText:
 *               type: number
 *               description: German text of the news
 *             frenchTitle:
 *               type: string
 *               description: French title of the news
 *             englishTitle:
 *               type: number
 *               description: English title of the news
 *             spanishTitle:
 *               type: string
 *               description: Spanish title of the news
 *             germanTitle:
 *               type: number
 *               description: German title of the news
 *     responses:
 *       200:
 *         description: Successfull Operation
 *       400:
 *         description: Invalid arguments
 *       500:
 *         description: Error
 */
routes.put(
	`${commonPath}/update/:title`,
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
	checkIsAdmin,
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
