import { http } from '../utils/index.js';
import { AllNews } from '@drpg/core/dist/models/news/AllNews.mjs';

export const NewsService = {
	getNewsFromPage(page: number): Promise<Array<Partial<AllNews>>> {
		return http()
			.get(`/news/page/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateNews(data: FormData, news: string): Promise<void> {
		return http()
			.put(`/news/update/${news}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createNews(data: FormData, news: string): Promise<void> {
		return http()
			.put(`/news/create/${news}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
