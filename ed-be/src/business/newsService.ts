import { Request } from 'express';
import { createNews, getBatchOfNews, updateAnyNews } from '../dao/newsDao.js';
import { News } from '../entity/news.js';

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
 * @return void
 *  */
export async function postNews(req: Request): Promise<void> {
	const postedNews: Partial<News> = {
		title: req.params.title,
		image: req.file?.buffer as Buffer,
		frenchTitle: req.body.frenchTitle,
		englishTitle: req.body.englishTitle,
		spanishTitle: req.body.spanishTitle,
		germanTitle: req.body.germanTitle,
		frenchText: req.body.frenchText,
		englishText: req.body.englishText,
		spanishText: req.body.spanishText,
		germanText: req.body.germanText
	};

	await createNews(postedNews);
}

/**
 * @summary Retrieve a batch of new
 * @param req
 * @param req.params.page {string} Number of the page
 * @param res
 * @return Array<News>
 */
export async function getNews(req: Request): Promise<Array<News>> {
	const batch: Array<News> = await getBatchOfNews(parseInt(req.params.page));

	return batch;
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
 * @return void
 */
export async function updateNews(req: Request): Promise<void> {
	const updatedNews: Partial<News> = {
		image: req.file?.buffer,
		frenchTitle: req.body.frenchTitle,
		englishTitle: req.body.englishTitle,
		spanishTitle: req.body.spanishTitle,
		germanTitle: req.body.germanTitle,
		frenchText: req.body.frenchText,
		englishText: req.body.englishText,
		spanishText: req.body.spanishText,
		germanText: req.body.germanText
	};

	await updateAnyNews(req.params.title, updatedNews);
}
