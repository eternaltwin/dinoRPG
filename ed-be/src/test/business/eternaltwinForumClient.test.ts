import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../context.js', () => ({
	GLOBAL: { config: { eternaltwin: { url: 'http://et/', section: 'drpg_main' } } },
	LOGGER: { error: vi.fn(), log: vi.fn() }
}));
vi.mock('../../dao/eternaltwinTokenDao.js', () => ({ deleteToken: vi.fn() }));

import { deleteToken } from '../../dao/eternaltwinTokenDao.js';
import {
	EternaltwinAuthError,
	EternaltwinConflictError,
	EternaltwinForbiddenError,
	EternaltwinForumClient,
	EternaltwinNotFoundError
} from '../../business/eternaltwinForumClient.js';
import { postWire, revisionWire, sectionWire, threadWire } from '../helpers/eternaltwinForum.js';

function jsonResponse(body: unknown, status = 200) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
		text: async () => JSON.stringify(body)
	} as never;
}

const fetchMock = vi.fn();

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal('fetch', fetchMock);
});

function client(origin = 'http://et/') {
	return new EternaltwinForumClient('p1', 'tok', origin);
}

describe('EternaltwinForumClient', () => {
	it('sends the bearer token on every call', async () => {
		fetchMock.mockResolvedValue(jsonResponse(sectionWire));
		await client().getSection('drpg_main', 0, 20);

		const [, init] = fetchMock.mock.calls[0];
		expect(init.headers.Authorization).toBe('Bearer tok');
	});

	it('reads page sizes from the instance instead of assuming them', async () => {
		fetchMock.mockResolvedValue(
			jsonResponse({ captcha: { enabled: false }, forum: { threads_per_page: 15, posts_per_page: 7 } })
		);
		// A distinct origin, so the module-level cache from other tests cannot answer.
		const sizes = await client('http://sizes/').getPageSizes();

		expect(sizes).toEqual({ threadsPerPage: 15, postsPerPage: 7 });
		expect(String(fetchMock.mock.calls[0][0])).toBe('http://sizes/api/v1/config');
	});

	it('caches page sizes per origin', async () => {
		fetchMock.mockResolvedValue(
			jsonResponse({ captcha: { enabled: false }, forum: { threads_per_page: 20, posts_per_page: 10 } })
		);
		const c = client('http://cached/');
		await c.getPageSizes();
		await c.getPageSizes();

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('drops the stored token on 401 so the next try re-authorizes', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ error: 'nope' }, 401));

		await expect(client().getSection('drpg_main', 0, 20)).rejects.toBeInstanceOf(EternaltwinAuthError);
		expect(deleteToken).toHaveBeenCalledWith('p1');
	});

	it('does not retry a 403 and keeps the token', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ code: 'forbidden' }, 403));

		await expect(client().createThread('drpg_main', 't', 'b')).rejects.toBeInstanceOf(EternaltwinForbiddenError);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(deleteToken).not.toHaveBeenCalled();
	});

	it('treats 404 as absent and 409 as stale', async () => {
		fetchMock.mockResolvedValue(jsonResponse({}, 404));
		await expect(client().getThread('t1', 0, 10)).rejects.toBeInstanceOf(EternaltwinNotFoundError);

		fetchMock.mockResolvedValue(jsonResponse({}, 409));
		await expect(client().getThread('t1', 0, 10)).rejects.toBeInstanceOf(EternaltwinConflictError);
	});

	it('posts a thread as Marktwin title/body', async () => {
		fetchMock.mockResolvedValue(jsonResponse(threadWire));
		await client().createThread('drpg_main', 'Titre', '**gras**');

		const [uri, init] = fetchMock.mock.calls[0];
		expect(String(uri)).toBe('http://et/api/v1/forum/sections/drpg_main');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body)).toEqual({ title: 'Titre', body: '**gras**' });
	});

	it('marks a thread read up to the post shown', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ is_unread: false }));
		const self = await client().markThreadRead('t1', '5f2b3c4d-6e7f-4a8b-9c0d-1e2f3a4b5c6d');

		const [uri, init] = fetchMock.mock.calls[0];
		expect(String(uri)).toBe('http://et/api/v1/forum/threads/t1/read');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body)).toEqual({ up_to_post: '5f2b3c4d-6e7f-4a8b-9c0d-1e2f3a4b5c6d' });
		expect(self).toEqual({ isUnread: false });
	});

	it('sends last_revision_id when rewriting a post', async () => {
		fetchMock.mockResolvedValue(jsonResponse(postWire(1, 0, [revisionWire('5f2b3c4d-6e7f-4a8b-9c0d-1e2f3a4b5c6d')])));
		await client().updatePost('post1', 'rev1', 'nouveau', 'typo');

		const [uri, init] = fetchMock.mock.calls[0];
		expect(String(uri)).toBe('http://et/api/v1/forum/posts/post1');
		expect(init.method).toBe('PATCH');
		expect(JSON.parse(init.body)).toEqual({
			last_revision_id: 'rev1',
			content: 'nouveau',
			comment: 'typo'
		});
	});

	it('asks for the source on its own endpoint', async () => {
		fetchMock.mockResolvedValue(
			jsonResponse(postWire(1, 0, [revisionWire('5f2b3c4d-6e7f-4a8b-9c0d-1e2f3a4b5c6d', 'v1')]))
		);
		const post = await client().getPostSource('post1');

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(String(fetchMock.mock.calls[0][0])).toBe('http://et/api/v1/forum/posts/post1/source?offset=0&limit=1');
		expect(post.revisions.items[0].content?.marktwin).toBe('v1');
	});

	it('reads the source of the latest revision, which the server lists last', async () => {
		const first = revisionWire('5f2b3c4d-6e7f-4a8b-9c0d-1e2f3a4b5c6d', 'v1');
		const latest = revisionWire('6a3c4d5e-7f8a-4b9c-8d1e-2f3a4b5c6d7e', 'v3');
		fetchMock
			.mockResolvedValueOnce(jsonResponse(postWire(3, 0, [first])))
			.mockResolvedValueOnce(jsonResponse(postWire(3, 2, [latest])));

		const post = await client().getPostSource('post1');

		expect(String(fetchMock.mock.calls[1][0])).toBe('http://et/api/v1/forum/posts/post1/source?offset=2&limit=1');
		expect(post.revisions.items[0].id).toBe('6a3c4d5e-7f8a-4b9c-8d1e-2f3a4b5c6d7e');
		expect(post.revisions.items[0].content?.marktwin).toBe('v3');
	});

	it('decodes replies into the @eternaltwin/core types', async () => {
		fetchMock.mockResolvedValue(jsonResponse(threadWire));
		const thread = await client().getThread('t1', 0, 10);

		expect(thread.isLocked).toBe(false);
		expect(thread.self.canPost).toBe(true);
		expect(thread.section.self.grammar.strong).toBe(true);
		expect(thread.posts.items[0].self.canEdit).toBe(true);
		expect(thread.ctime).toBeInstanceOf(Date);
	});

	it('rejects a reply that does not match the expected type', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ type: 'ForumThread' }));

		await expect(client().getThread('t1', 0, 10)).rejects.toThrow();
	});
});
