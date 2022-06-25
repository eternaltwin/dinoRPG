import { News } from '../models/index.js';

const createNews = (allText: News): Promise<News | null> => {
	return News.create(allText);
};

const getBatchOfNews = (page: number): Promise<Array<News>> => {
	return News.findAll({
		attributes: [
			'title',
			'image',
			'frenchTitle',
			'englishTitle',
			'spanishTitle',
			'germanTitle',
			'frenchText',
			'englishText',
			'spanishText',
			'germanText'
		],
		order: [['createdAt', 'DESC']],
		limit: 10,
		offset: 10 * page - 10
	});
};

const updateAnyNews = (title: string, newObject: Partial<News>): Promise<[number, Array<News>]> => {
	return News.update(newObject, {
		where: { title: title }
	});
};

export { createNews, getBatchOfNews, updateAnyNews };
