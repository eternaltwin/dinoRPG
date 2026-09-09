import { http } from '../utils/index.js';
import { ForumPostSource, ForumType, Thread, forumPost } from '@drpg/core/models/forum/Forum';

export const ForumService = {
	/**
	 * The DinoRPG section with one page of its threads.
	 *
	 * The whole section, not just its threads: `self.grammar` says what the player may write here,
	 * and it has to reach the editor.
	 */
	async getPageThreads(page: number): Promise<ForumType> {
		const res = await http().get(`/forum/${page}`);
		return res.data;
	},
	async getThread(threadId: string, page: number): Promise<Thread> {
		const res = await http().get(`/forum/${threadId}/${page}`);
		return res.data;
	},
	/** `message` is Marktwin, not HTML: it goes to Eternaltwin's own parser. */
	async createThread(title: string, message: string): Promise<Thread> {
		const res = await http().post(`/forum/newThread`, {
			title: title,
			message: message
		});
		return res.data;
	},
	async replyToThread(threadId: string, message: string): Promise<forumPost> {
		const res = await http().post(`/forum/${threadId}/reply`, {
			message: message
		});
		return res.data;
	},
	/**
	 * The Marktwin source of a post, to open an editor on it. Ordinary reads only carry the
	 * rendered HTML.
	 */
	async getPostSource(postId: string): Promise<ForumPostSource> {
		const res = await http().get(`/forum/posts/${postId}/source`);
		return res.data;
	},
	/**
	 * Rewrite a post. The revision being replaced is looked up server-side, so a browser that held
	 * an editor open cannot send a stale one and overwrite somebody else's edit.
	 */
	async updatePost(postId: string, content: string, comment?: string): Promise<forumPost> {
		const res = await http().patch(`/forum/posts/${postId}`, {
			content: content,
			comment: comment
		});
		return res.data;
	}
};
