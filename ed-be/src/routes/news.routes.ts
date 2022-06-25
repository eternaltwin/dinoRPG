import { Router } from 'express';
import { apiRoutes } from '../constants/index.js';
import { body, param } from 'express-validator';
import { checkIsAdmin } from '../utils/jwt.js';
import { getNews, postNews, updateNews } from '../business/newsService.js';
import multer from 'multer';

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
	checkIsAdmin,
	postNews
);

routes.get(`${commonPath}/page/:page`, param('page').exists().toInt().isInt(), getNews);

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
	updateNews
);

export default routes;
