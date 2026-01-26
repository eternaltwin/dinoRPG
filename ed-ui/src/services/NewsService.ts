import { NewsGetResponse } from '@drpg/core/returnTypes/News';
import { http } from '../utils/index.js';
import { DetailedNews } from '@drpg/core/models/news/AllNews';
import { returnType } from '@drpg/core/models/enums/returnCode';

export const NewsService = {
	async getNewsFromPage(page: number): Promise<NewsGetResponse[]> {
		const res = await http().get(`/news/page/${page}`);
		return res.data;
	},
	async getAllNews(): Promise<Partial<DetailedNews>[]> {
		const res = await http().get(`/news/all`);
		return res.data;
	},
	async getNewsAdmin(id: number): Promise<DetailedNews> {
		const res = await http().get(`/news/${id}`);
		return res.data;
	},
	async updateNews(data: FormData, id: number): Promise<void> {
		const res = await http().put(`/news/update/${id}`, data, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return res.data;
	},
	async createNews(data: FormData, news: string): Promise<DetailedNews> {
		const res = await http().put(`/news/create/${news}`, data, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return res.data;
	},
	async deleteNews(id: number): Promise<void> {
		const res = await http().delete(`/news/delete/${id}`);
		return res.data;
	},
	async createPoll(data: FormData, news: string): Promise<void> {
		const res = await http().put(`/news/createPoll/${news}`, data, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return res.data;
	},
	async votePoll(id: number, option: number): Promise<returnType> {
		const res = await http().put(`/news/poll/${id}/${option}`);
		return res.data;
	},
	async toggleLike(newsId: number): Promise<{ newsId: number; likes: number; likedByMe: boolean }> {
		const res = await http().post(`/news/${newsId}/like`);
		return res.data;
	}
};
