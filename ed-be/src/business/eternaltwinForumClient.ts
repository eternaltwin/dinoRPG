import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { $Config } from '@eternaltwin/core/config/config';
import { $CreatePostOptions } from '@eternaltwin/core/forum/create-post-options';
import { $CreateThreadOptions } from '@eternaltwin/core/forum/create-thread-options';
import type { ForumConfig } from '@eternaltwin/core/forum/forum-config';
import { $ForumPost, type ForumPost } from '@eternaltwin/core/forum/forum-post';
import { $ForumSection, type ForumSection } from '@eternaltwin/core/forum/forum-section';
import { $ForumSectionListing, type ForumSectionListing } from '@eternaltwin/core/forum/forum-section-listing';
import { $ForumThread, type ForumThread } from '@eternaltwin/core/forum/forum-thread';
import { $ForumThreadMetaSelf, type ForumThreadMetaSelf } from '@eternaltwin/core/forum/forum-thread-meta-self';
import { $MarkThreadReadBody } from '@eternaltwin/core/forum/mark-thread-read-body';
import { $UpdatePostOptions } from '@eternaltwin/core/forum/update-post-options';
import { type IoType, readOrThrow } from 'kryo';
import { JSON_READER } from 'kryo-json/json-reader';
import { JSON_WRITER } from 'kryo-json/json-writer';
import urlJoin from 'url-join';
import { GLOBAL } from '../context.js';
import { deleteToken } from '../dao/eternaltwinTokenDao.js';

/**
 * The stored token no longer authenticates. There is no refresh flow to fall back on: the only
 * cure is to send the player through authorization again.
 */
export class EternaltwinAuthError extends ExpectedError {}

/**
 * The server refused the action (403). It covers three causes that are indistinguishable from
 * here — a token without `forum:write`, a player without the role, a player who is muted — and
 * none of them is repaired by trying again.
 */
export class EternaltwinForbiddenError extends ExpectedError {}

/** Nonexistent, or hidden from this player. Either way: absent. */
export class EternaltwinNotFoundError extends ExpectedError {}

/** Already in the requested state; re-read the resource. */
export class EternaltwinConflictError extends ExpectedError {}

/**
 * Page sizes are a property of the instance, not of a request; one lookup per origin is enough.
 */
const pageSizeCache = new Map<string, ForumConfig>();

/**
 * A minimal Eternaltwin forum client.
 *
 * No official client library covers the forum — the Kotlin, Ruby, `@eternaltwin/client-node` and
 * PHP clients stop at `auth/self` and users — so this speaks plain HTTP. The payloads still go
 * through the codecs `@eternaltwin/core` ships: a reply that does not match them is rejected here,
 * rather than reaching the interface half-read.
 *
 * It must only ever run on the server: Eternaltwin's CORS policy allows a single fixed origin, so
 * a call from a player's browser is blocked before it leaves, and the access token has no business
 * on the client anyway.
 */
export class EternaltwinForumClient {
	readonly #origin: string;

	readonly #accessToken: string;

	readonly #playerId: string;

	public constructor(playerId: string, accessToken: string, origin: string = GLOBAL.config.eternaltwin.url) {
		this.#playerId = playerId;
		this.#accessToken = accessToken;
		this.#origin = origin;
	}

	async #request<T>(path: string, resType: IoType<T>, init: RequestInit = {}): Promise<T> {
		const uri = new URL(urlJoin(this.#origin, path));

		const response = await fetch(uri, {
			...init,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.#accessToken}`,
				...init.headers
			}
		});

		if (!response.ok) {
			await this.#throwForStatus(response, uri);
		}

		return readOrThrow(resType, JSON_READER, await response.text());
	}

	async #throwForStatus(response: Response, uri: URL): Promise<never> {
		// The body is best-effort: refusals do not follow RFC 6749, and some carry no body at all.
		const detail = await response.text().catch(() => '');
		const suffix = detail ? `: ${detail}` : '';

		switch (response.status) {
			case 401:
				// Unreadable credentials. Drop the token so the next attempt starts a fresh
				// authorization instead of replaying something the server already rejected.
				await deleteToken(this.#playerId);
				throw new EternaltwinAuthError(`eternaltwinReauthorize${suffix}`);
			case 403:
				throw new EternaltwinForbiddenError(`eternaltwinForbidden${suffix}`);
			case 404:
				throw new EternaltwinNotFoundError(`eternaltwinNotFound${suffix}`);
			case 409:
				throw new EternaltwinConflictError(`eternaltwinConflict${suffix}`);
			default:
				throw new Error(`Eternaltwin request failed (${response.status}) on ${uri.pathname}${suffix}`);
		}
	}

	/**
	 * Page sizes used by the Eternaltwin site, so the game paginates the same way it does.
	 */
	public async getPageSizes(): Promise<ForumConfig> {
		const cached = pageSizeCache.get(this.#origin);
		if (cached !== undefined) {
			return cached;
		}
		const config = await this.#request('api/v1/config', $Config);
		pageSizeCache.set(this.#origin, config.forum);
		return config.forum;
	}

	public async listSections(): Promise<ForumSectionListing> {
		return this.#request('api/v1/forum/sections', $ForumSectionListing);
	}

	/**
	 * A section and one page of its threads. `sectionRef` accepts a UUID or a section key.
	 */
	public async getSection(sectionRef: string, offset: number, limit: number): Promise<ForumSection> {
		return this.#request(`api/v1/forum/sections/${sectionRef}?offset=${offset}&limit=${limit}`, $ForumSection);
	}

	/** Open a thread. `body` is Marktwin. */
	public async createThread(sectionRef: string, title: string, body: string): Promise<ForumThread> {
		return this.#request(`api/v1/forum/sections/${sectionRef}`, $ForumThread, {
			method: 'POST',
			body: $CreateThreadOptions.write(JSON_WRITER, { title, body })
		});
	}

	public async getThread(threadRef: string, offset: number, limit: number): Promise<ForumThread> {
		return this.#request(`api/v1/forum/threads/${threadRef}?offset=${offset}&limit=${limit}`, $ForumThread);
	}

	/**
	 * Record that the player has been shown every post up to `upToPost`.
	 *
	 * The server only ever moves the marker forward, so reading an earlier page again does not
	 * make the thread unread.
	 */
	public async markThreadRead(threadRef: string, upToPost: string): Promise<ForumThreadMetaSelf> {
		return this.#request(`api/v1/forum/threads/${threadRef}/read`, $ForumThreadMetaSelf, {
			method: 'POST',
			body: $MarkThreadReadBody.write(JSON_WRITER, { upToPost })
		});
	}

	/** Reply to a thread. `body` is Marktwin. */
	public async replyToThread(threadRef: string, body: string): Promise<ForumPost> {
		return this.#request(`api/v1/forum/threads/${threadRef}`, $ForumPost, {
			method: 'POST',
			body: $CreatePostOptions.write(JSON_WRITER, { body })
		});
	}

	public async getPost(postRef: string): Promise<ForumPost> {
		return this.#request(`api/v1/forum/posts/${postRef}`, $ForumPost);
	}

	/**
	 * A post with the Marktwin source of its latest revision, for an editor. Ordinary reads do not
	 * carry the source.
	 *
	 * The server lists revisions oldest first, so the latest one is on the last page: a first read of
	 * a single revision gives the count, and a second one fetches the last when there is more than
	 * one. `revisions.items` holds that latest revision alone.
	 */
	public async getPostSource(postRef: string): Promise<ForumPost> {
		const first = await this.#request(`api/v1/forum/posts/${postRef}/source?offset=0&limit=1`, $ForumPost);
		const count = first.revisions.count;
		if (count <= 1) {
			return first;
		}
		return this.#request(`api/v1/forum/posts/${postRef}/source?offset=${count - 1}&limit=1`, $ForumPost);
	}

	/**
	 * Rewrite a post.
	 *
	 * `lastRevisionId` is the id of the revision being replaced — that is how the server detects
	 * two concurrent edits, so it must come from a fresh {@link getPostSource} rather than from
	 * whatever the editor was opened with.
	 */
	public async updatePost(
		postRef: string,
		lastRevisionId: string,
		content: string,
		comment: string | null
	): Promise<ForumPost> {
		return this.#request(`api/v1/forum/posts/${postRef}`, $ForumPost, {
			method: 'PATCH',
			body: $UpdatePostOptions.write(JSON_WRITER, { lastRevisionId, content, comment })
		});
	}
}
