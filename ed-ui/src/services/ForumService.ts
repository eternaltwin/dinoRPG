import { http } from '../utils/index.js';
import { forumThreads, posts } from '@drpg/core/models/forum/Forum';

export const ForumService = {
	async getPageThreads(page: number): Promise<forumThreads> {
		const res = await http().get(`/forum/${page}`);
		return res.data;
	},
	async getThread(threadId: string, page: number): Promise<{ thread: posts; title: string }> {
		const res = await http().get(`/forum/${threadId}/${page}`);
		return res.data;
	},
	async createThread(title: string, message: string): Promise<{ thread: posts; title: string }> {
		const res = await http().post(`/forum/newThread`, {
			title: title,
			message: message
		});
		return res.data;
	}
};
