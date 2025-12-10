import { NewsGetResponse } from '@drpg/core/returnTypes/News';
import { http } from '../utils/index.js';
import { DetailedNews } from '@drpg/core/models/news/AllNews';
import { returnType } from '@drpg/core/models/enums/returnCode';

export const NewsService = {
	async getNewsFromPage(page: number): Promise<NewsGetResponse[]> {
		return http()
			.get(`/news/page/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async getAllNews(): Promise<Partial<DetailedNews>[]> {
		return http()
			.get(`/news/all`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async getNewsAdmin(id: number): Promise<DetailedNews> {
		return http()
			.get(`/news/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async updateNews(data: FormData, id: number): Promise<void> {
		return http()
			.put(`/news/update/${id}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async createNews(data: FormData, news: string): Promise<DetailedNews> {
		return http()
			.put(`/news/create/${news}`, data, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async deleteNews(id: number): Promise<void> {
		return http()
			.delete(`/news/delete/${id}`)
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
	async votePoll(id: number, option: number): Promise<returnType> {
		return http()
			.put(`/news/poll/${id}/${option}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async toggleLike(newsId: number): Promise<{ newsId: number; likes: number; likedByMe: boolean }> {
		return http()
			.post(`/news/${newsId}/like`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
