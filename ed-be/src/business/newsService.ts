import { Request } from 'express';
import {
	createNews,
	getBatchOfNews,
	getNewsIllus,
	updateAnyNews,
	getNewsDate,
	hasPlayerLikedNews,
	likeNews,
	unlikeNews
} from '../dao/newsDao.js';
import { auth } from '../dao/playerDao.js';

/**
 * @summary Create a news
 * @param req
 * @param req.params.title {string} Title of the new
 * @param req.file.buffer {blob} Image of the new
 * @param req.body.frenchTitle {string} French title
 * @param req.body.englishTitle {string} English title
 * @param req.body.spanishTitle {string} Spanish title
 * @param req.body.germanTitle {string} German title
 * @param req.body.frenchText {string} French text
 * @param req.body.englishText {string} English text
 * @param req.body.spanishText {string} Spanish text
 * @param req.body.germanText {string} German text
 *  */
export async function postNews(req: Request) {
	await createNews({
		title: req.params.title,
		image: req.file?.buffer,
		frenchTitle: req.body.frenchTitle,
		englishTitle: req.body.englishTitle,
		spanishTitle: req.body.spanishTitle,
		germanTitle: req.body.germanTitle,
		frenchText: req.body.frenchText,
		englishText: req.body.englishText,
		spanishText: req.body.spanishText,
		germanText: req.body.germanText
	});
}

/**
 * @summary Retrieve a batch of new
 * @param req
 * @param req.params.page {string} Number of the page
 * @param req.query.playerId {string} Player ID to check if the news is liked by the player
 * @param res
 */
export async function getNews(req: Request) {
	const player = await auth(req);
	const news = await getBatchOfNews(+req.params.page, player.id);

	return news;
}

/**
 * @summary Update a selected news
 * @param req
 * @param req.params.title {string} Title of the new
 * @param req.file.buffer {blob} Image of the new to update
 * @param req.body.frenchTitle {string} French title to update
 * @param req.body.englishTitle {string} English title to update
 * @param req.body.spanishTitle {string} Spanish title to update
 * @param req.body.germanTitle {string} German title to update
 * @param req.body.frenchText {string} French text to update
 * @param req.body.englishText {string} English text to update
 * @param req.body.spanishText {string} Spanish text to update
 * @param req.body.germanText {string} German text to update
 */
export async function updateNews(req: Request) {
	await updateAnyNews(req.params.title, {
		image: req.file?.buffer,
		frenchTitle: req.body.frenchTitle,
		englishTitle: req.body.englishTitle,
		spanishTitle: req.body.spanishTitle,
		germanTitle: req.body.germanTitle,
		frenchText: req.body.frenchText,
		englishText: req.body.englishText,
		spanishText: req.body.spanishText,
		germanText: req.body.germanText
	});
}

export async function getNewsIllustration(req: Request<{ id: string }>) {
	const news = await getNewsIllus(+req.params.id);

	return news.image;
}

export async function getNewsCreatedDate(req: Request<{ id: string }>) {
	const news = await getNewsDate(+req.params.id);

	return news.createdDate;
}

export async function toggleLikeNews(newsId: number, playerId: string) {
	const hasLiked = await hasPlayerLikedNews(newsId, playerId);

	return hasLiked ? unlikeNews(newsId, playerId) : likeNews(newsId, playerId);
}
