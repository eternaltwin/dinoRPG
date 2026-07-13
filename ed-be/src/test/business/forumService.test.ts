import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../context.js', () => ({
	GLOBAL: { config: { eternaltwin: { url: 'http://et/', section: 'sec' } } }
}));

import { getAllThreadsFromPage, getThread, createThread } from '../../business/forumService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	globalThis.fetch = vi.fn() as never;
});

describe('forumService', () => {
	it('getAllThreadsFromPage returns threads', async () => {
		vi.mocked(globalThis.fetch as never).mockResolvedValue({
			json: vi.fn().mockResolvedValue({ threads: ['t1'] })
		} as never);
		expect(await getAllThreadsFromPage(req({ page: '1' }))).toEqual(['t1']);
	});

	it('getThread returns posts and title', async () => {
		vi.mocked(globalThis.fetch as never).mockResolvedValue({
			json: vi.fn().mockResolvedValue({ posts: ['p1'], title: 'T' })
		} as never);
		const result = await getThread(req({ threadId: 'th', page: '1' }));
		expect(result).toEqual({ thread: ['p1'], title: 'T' });
	});

	it('createThread posts and returns thread', async () => {
		vi.mocked(globalThis.fetch as never).mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({ posts: ['p1'], title: 'New' })
		} as never);
		const result = await createThread(req({}, { title: 'New', message: 'msg' }));
		expect(result).toEqual({ thread: ['p1'], title: 'New' });
	});

	it('createThread throws when the request fails', async () => {
		vi.mocked(globalThis.fetch as never).mockResolvedValue({ ok: false, status: 500, statusText: 'err' } as never);
		await expect(createThread(req({}, { title: 'x', message: 'y' }))).rejects.toThrow('Failed to create thread');
	});
});
