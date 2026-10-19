import { http } from '../utils/index.js';
import { $ForumPost, type ForumPost } from '@eternaltwin/core/forum/forum-post';
import { $ForumSection, type ForumSection } from '@eternaltwin/core/forum/forum-section';
import { $ForumThread, type ForumThread } from '@eternaltwin/core/forum/forum-thread';
import { type IoType, readOrThrow } from 'kryo';
import { JSON_VALUE_READER } from 'kryo-json/json-value-reader';

/**
 * The backend relays Eternaltwin's wire format; decoding it with the `@eternaltwin/core` codecs gives
 * the official types (camelCase, `Date`, `ObjectType` symbols) and rejects a payload that does not
 * match them.
 */
function decode<T>(type: IoType<T>, data: unknown): T {
	return readOrThrow(type, JSON_VALUE_READER, data as never);
}

export const ForumService = {
	/**
	 * A section with one page of its threads and its sub-sections; without `sectionId`, the DinoRPG
	 * root section.
	 *
	 * The whole section, not just its threads: `self.grammar` says what the player may write here,
	 * and it has to reach the editor.
	 */
	async getSection(sectionId: string | undefined, page: number): Promise<ForumSection> {
		const res = await http().get(sectionId ? `/forum/sections/${sectionId}/${page}` : `/forum/${page}`);
		return decode($ForumSection, res.data);
	},
	async getThread(threadId: string, page: number): Promise<ForumThread> {
		const res = await http().get(`/forum/${threadId}/${page}`);
		return decode($ForumThread, res.data);
	},
	/** `message` is Marktwin, not HTML: it goes to Eternaltwin's own parser. */
	async createThread(sectionId: string, title: string, message: string): Promise<ForumThread> {
		const res = await http().post(`/forum/newThread`, {
			sectionId: sectionId,
			title: title,
			message: message
		});
		return decode($ForumThread, res.data);
	},
	async replyToThread(threadId: string, message: string): Promise<ForumPost> {
		const res = await http().post(`/forum/${threadId}/reply`, {
			message: message
		});
		return decode($ForumPost, res.data);
	},
	/**
	 * A post with the Marktwin source of its latest revision, to open an editor on it. Ordinary reads
	 * only carry the rendered HTML. `revisions.items` holds that latest revision alone.
	 */
	async getPostSource(postId: string): Promise<ForumPost> {
		const res = await http().get(`/forum/posts/${postId}/source`);
		return decode($ForumPost, res.data);
	},
	/**
	 * Rewrite a post. The revision being replaced is looked up server-side, so a browser that held
	 * an editor open cannot send a stale one and overwrite somebody else's edit.
	 */
	async updatePost(postId: string, content: string, comment?: string): Promise<ForumPost> {
		const res = await http().patch(`/forum/posts/${postId}`, {
			content: content,
			comment: comment
		});
		return decode($ForumPost, res.data);
	}
};
