import { http } from '../utils/index.js';
import { forumThreads, posts } from '@drpg/core/models/forum/Forum';

export const ForumService = {
	getPageThreads(page: number): Promise<forumThreads> {
		return http()
			.get(`/forum/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getThread(threadId: string, page: number): Promise<{ thread: posts; title: string }> {
		return http()
			.get(`/forum/${threadId}/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createThread(title: string, message: string): Promise<{ thread: posts; title: string }> {
		return http()
			.post(`/forum/newThread`, {
				title: title,
				message: message
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
