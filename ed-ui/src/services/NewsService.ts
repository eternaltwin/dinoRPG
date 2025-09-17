import { NewsGetResponse } from '@drpg/core/returnTypes/News';
import { http } from '../utils/index.js';

export const NewsService = {
	async getNewsFromPage(page: number): Promise<NewsGetResponse> {
		return http()
			.get(`/news/page/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async updateNews(data: FormData, news: string): Promise<void> {
		return http()
			.put(`/news/update/${news}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async createNews(data: FormData, news: string): Promise<void> {
		return http()
			.put(`/news/create/${news}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async createPoll(data: FormData, news: string): Promise<void> {
		return http()
			.put(`/news/createPoll/${news}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async votePoll(id: number, option: number): Promise<void> {
		return http()
			.put(`/news/poll/${id}/${option}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
