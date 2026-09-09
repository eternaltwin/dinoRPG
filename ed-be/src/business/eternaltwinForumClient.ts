import type {
	EternaltwinForumConfig,
	ForumPostSource,
	ForumSectionListing,
	ForumType,
	Thread,
	forumPost
} from '@drpg/core/models/forum/Forum';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
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
const pageSizeCache = new Map<string, EternaltwinForumConfig['forum']>();

/**
 * A minimal Eternaltwin forum client.
 *
 * No official client library covers the forum — the Kotlin, Ruby, `@eternaltwin/client-node` and
 * PHP clients stop at `auth/self` and users — so this speaks plain HTTP.
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

	async #request<T>(path: string, init: RequestInit = {}): Promise<T> {
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

		return (await response.json()) as T;
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
	public async getPageSizes(): Promise<EternaltwinForumConfig['forum']> {
		const cached = pageSizeCache.get(this.#origin);
		if (cached !== undefined) {
			return cached;
		}
		const config = await this.#request<EternaltwinForumConfig>('api/v1/config');
		pageSizeCache.set(this.#origin, config.forum);
		return config.forum;
	}

	public async listSections(): Promise<ForumSectionListing> {
		return this.#request<ForumSectionListing>('api/v1/forum/sections');
	}

	/**
	 * A section and one page of its threads. `sectionRef` accepts a UUID or a section key.
	 */
	public async getSection(sectionRef: string, offset: number, limit: number): Promise<ForumType> {
		return this.#request<ForumType>(`api/v1/forum/sections/${sectionRef}?offset=${offset}&limit=${limit}`);
	}

	/** Open a thread. `body` is Marktwin. */
	public async createThread(sectionRef: string, title: string, body: string): Promise<Thread> {
		return this.#request<Thread>(`api/v1/forum/sections/${sectionRef}`, {
			method: 'POST',
			body: JSON.stringify({ title, body })
		});
	}

	public async getThread(threadRef: string, offset: number, limit: number): Promise<Thread> {
		return this.#request<Thread>(`api/v1/forum/threads/${threadRef}?offset=${offset}&limit=${limit}`);
	}

	/** Reply to a thread. `body` is Marktwin. */
	public async replyToThread(threadRef: string, body: string): Promise<forumPost> {
		return this.#request<forumPost>(`api/v1/forum/threads/${threadRef}`, {
			method: 'POST',
			body: JSON.stringify({ body })
		});
	}

	public async getPost(postRef: string): Promise<forumPost> {
		return this.#request<forumPost>(`api/v1/forum/posts/${postRef}`);
	}

	/**
	 * The Marktwin source of a post, for an editor. Ordinary reads do not carry it.
	 */
	public async getPostSource(postRef: string): Promise<ForumPostSource> {
		return this.#request<ForumPostSource>(`api/v1/forum/posts/${postRef}/source`);
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
	): Promise<forumPost> {
		return this.#request<forumPost>(`api/v1/forum/posts/${postRef}`, {
			method: 'PATCH',
			body: JSON.stringify({ last_revision_id: lastRevisionId, content, comment })
		});
	}
}
