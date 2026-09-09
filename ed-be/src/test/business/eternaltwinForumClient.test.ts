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
		fetchMock.mockResolvedValue(jsonResponse({ type: 'ForumSection' }));
		await client().getSection('drpg_main', 0, 20);

		const [, init] = fetchMock.mock.calls[0];
		expect(init.headers.Authorization).toBe('Bearer tok');
	});

	it('reads page sizes from the instance instead of assuming them', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ forum: { threads_per_page: 15, posts_per_page: 7 } }));
		// A distinct origin, so the module-level cache from other tests cannot answer.
		const sizes = await client('http://sizes/').getPageSizes();

		expect(sizes).toEqual({ threads_per_page: 15, posts_per_page: 7 });
		expect(String(fetchMock.mock.calls[0][0])).toBe('http://sizes/api/v1/config');
	});

	it('caches page sizes per origin', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ forum: { threads_per_page: 20, posts_per_page: 10 } }));
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
		fetchMock.mockResolvedValue(jsonResponse({ type: 'ForumThread' }));
		await client().createThread('drpg_main', 'Titre', '**gras**');

		const [uri, init] = fetchMock.mock.calls[0];
		expect(String(uri)).toBe('http://et/api/v1/forum/sections/drpg_main');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body)).toEqual({ title: 'Titre', body: '**gras**' });
	});

	it('sends last_revision_id when rewriting a post', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ type: 'ForumPost' }));
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
		fetchMock.mockResolvedValue(jsonResponse({ type: 'ForumPost' }));
		await client().getPostSource('post1');

		expect(String(fetchMock.mock.calls[0][0])).toBe('http://et/api/v1/forum/posts/post1/source');
	});
});
