import type { ForumPostSource, ForumType, Thread, forumPost } from '@drpg/core/models/forum/Forum';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Request } from 'express';
import { GLOBAL } from '../context.js';
import { getToken } from '../dao/eternaltwinTokenDao.js';
import { auth } from '../dao/playerDao.js';
import { EternaltwinForumClient } from './eternaltwinForumClient.js';

/**
 * Build a forum client acting for the player behind this request.
 *
 * Every call is made from the backend with the player's own access token, never from their
 * browser: Eternaltwin's CORS policy would block that, and the token does not belong client-side.
 */
async function clientFor(req: Request): Promise<{ client: EternaltwinForumClient; playerId: string }> {
	const authed = await auth(req);
	const token = await getToken(authed.id);

	if (token === null) {
		// Nothing to refresh into — the player has to authorize again.
		throw new ExpectedError('eternaltwinReauthorize');
	}

	return {
		client: new EternaltwinForumClient(authed.id, token.accessToken),
		playerId: authed.id
	};
}

/**
 * The DinoRPG section, with one page of its threads.
 *
 * The whole section is returned rather than its thread listing alone: the `self` block carries the
 * roles and the Marktwin grammar the player may write with, and the editor must offer exactly what
 * the server accepts. It is passed through untouched — permissions are the server's to compute.
 */
export async function getAllThreadsFromPage(req: Request): Promise<ForumType> {
	const { client } = await clientFor(req);
	const page = +req.params.page;

	const { threads_per_page: limit } = await client.getPageSizes();

	return client.getSection(GLOBAL.config.eternaltwin.section, (page - 1) * limit, limit);
}

/**
 * A thread and one page of its posts.
 *
 * The whole thread is returned: it carries `self` (what the player may do here), `section.self`
 * (the grammar to write with) and a `self` per post (whether it may still be edited). Dropping any
 * of them would leave the interface guessing at permissions it was handed.
 */
export async function getThread(req: Request): Promise<Thread> {
	const { client } = await clientFor(req);
	const threadId = req.params.threadId;
	const page = +req.params.page;

	const { posts_per_page: limit } = await client.getPageSizes();

	return client.getThread(threadId, (page - 1) * limit, limit);
}

/**
 * Open a thread in the DinoRPG section. `message` is Marktwin, not HTML or Markdown.
 */
export async function createThread(req: Request): Promise<Thread> {
	const { client } = await clientFor(req);
	const title = req.body.title;
	const message = req.body.message;

	return client.createThread(GLOBAL.config.eternaltwin.section, title, message);
}

/**
 * Reply to a thread. `message` is Marktwin.
 */
export async function replyToThread(req: Request): Promise<forumPost> {
	const { client } = await clientFor(req);

	return client.replyToThread(req.params.threadId, req.body.message);
}

/**
 * The Marktwin source of a post, for opening an editor.
 *
 * Ordinary reads do not carry the source, and the caller needs the id of the last revision to
 * send back with the edit.
 */
export async function getPostSource(req: Request): Promise<ForumPostSource> {
	const { client } = await clientFor(req);

	return client.getPostSource(req.params.postId);
}

/**
 * Rewrite a post.
 *
 * The `last_revision_id` is re-read here rather than taken from the client: it identifies the
 * revision being replaced, which is how the server detects that someone else edited in between.
 * A stale one sent by a browser that held the editor open would defeat that check.
 */
export async function updatePost(req: Request): Promise<forumPost> {
	const { client } = await clientFor(req);
	const postId = req.params.postId;
	const content = req.body.content;
	const comment = req.body.comment ?? null;

	const source = await client.getPostSource(postId);
	const lastRevisionId = source.revisions?.last?.id;

	if (typeof lastRevisionId !== 'string') {
		throw new ExpectedError('eternaltwinPostRevisionUnavailable');
	}

	return client.updatePost(postId, lastRevisionId, content, comment);
}
