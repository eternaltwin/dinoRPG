import { UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { News } from '../entity/index.js';

const newsRepository = AppDataSource.getRepository(News);

const createNews = (allText: Partial<News>): Promise<News | null> => {
	return newsRepository.save(allText);
};

const getBatchOfNews = (page: number): Promise<Array<News>> => {
	return newsRepository
		.createQueryBuilder('news')
		.orderBy('news.createdDate', 'DESC')
		.limit(10)
		.offset(10 * page - 10)
		.getMany();
};

const updateAnyNews = (title: string, newObject: Partial<News>): Promise<UpdateResult> => {
	return newsRepository.createQueryBuilder().update(News).where('title = :t', { t: title }).set(newObject).execute();
};

export { createNews, getBatchOfNews, updateAnyNews };
