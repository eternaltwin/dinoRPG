import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../context.js', () => ({
	GLOBAL: { config: { eternaltwin: { url: 'http://et/', section: 'dinorpg' } } },
	LOGGER: { error: vi.fn(), log: vi.fn() }
}));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/eternaltwinTokenDao.js', () => ({ getToken: vi.fn(), deleteToken: vi.fn() }));

const clientInstance = {
	getPageSizes: vi.fn(),
	getSection: vi.fn(),
	getThread: vi.fn(),
	markThreadRead: vi.fn(),
	createThread: vi.fn(),
	replyToThread: vi.fn(),
	getPostSource: vi.fn(),
	updatePost: vi.fn()
};
vi.mock('../../business/eternaltwinForumClient.js', () => ({
	EternaltwinForumClient: vi.fn(function () {
		return clientInstance;
	})
}));

import { LOGGER } from '../../context.js';
import { auth } from '../../dao/playerDao.js';
import { getToken } from '../../dao/eternaltwinTokenDao.js';
import { createThread, getSection, getThread, replyToThread, updatePost } from '../../business/forumService.js';

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
	vi.mocked(getToken).mockResolvedValue({ accessToken: 'tok' } as never);
	clientInstance.getPageSizes.mockResolvedValue({ threadsPerPage: 20, postsPerPage: 10 });
});

describe('forumService', () => {
	it('asks the player to authorize again when no token is stored', async () => {
		vi.mocked(getToken).mockResolvedValue(null as never);

		await expect(getSection(makeRequest({ params: { page: '1' } } as never))).rejects.toThrow('eternaltwinReauthorize');
	});

	it('paginates with the instance page size, not a hardcoded 20', async () => {
		clientInstance.getPageSizes.mockResolvedValue({ threadsPerPage: 15, postsPerPage: 5 });
		clientInstance.getSection.mockResolvedValue({ threads: { items: [] } });

		await getSection(makeRequest({ params: { page: '3' } } as never));

		expect(clientInstance.getSection).toHaveBeenCalledWith('dinorpg', 30, 15);
	});

	it('reads the sub-section named in the route', async () => {
		clientInstance.getSection.mockResolvedValue({ threads: { items: [] }, children: [] });

		await getSection(makeRequest({ params: { sectionId: 'drpg_main', page: '2' } } as never));

		expect(clientInstance.getSection).toHaveBeenCalledWith('drpg_main', 20, 20);
	});

	it('hands the section over whole, grammar included', async () => {
		// The editor may only offer what the server will parse, and only the server knows what that
		// is. Returning the thread listing alone would strip the answer out of the payload.
		const section = {
			type: 'ForumSection',
			threads: { offset: 0, limit: 20, count: 1, items: [] },
			self: { roles: [], grammar: { strong: true, emphasis: true, strikethrough: false, links: ['https'] } }
		};
		clientInstance.getSection.mockResolvedValue(section);

		const result = await getSection(makeRequest({ params: { page: '1' } } as never));

		expect(result).toBe(section);
	});

	it('keeps the thread whole: its own self, the section grammar and the per-post self', async () => {
		const thread = {
			type: 'ForumThread',
			title: 'T',
			posts: { count: 1, items: [{ id: 'p1', self: { canEdit: true } }] },
			self: { canPost: true },
			section: { self: { grammar: { strong: true } } }
		};
		clientInstance.getThread.mockResolvedValue(thread);

		const result = await getThread(makeRequest({ params: { threadId: 't1', page: '1' } } as never));

		expect(result).toBe(thread);
	});

	it('passes the server-computed self block through untouched', async () => {
		const self = {
			canPost: false,
			canLock: false,
			canPin: false,
			canMove: false,
			canDelete: false,
			canReport: true
		};
		clientInstance.getThread.mockResolvedValue({ posts: { count: 0, items: [] }, title: 'T', self });

		const result = await getThread(makeRequest({ params: { threadId: 't1', page: '1' } } as never));

		// Permissions are the server's to compute; the service must not re-derive or drop them.
		expect(result.self).toBe(self);
	});

	it('marks the thread read up to the last post of the page returned', async () => {
		clientInstance.getThread.mockResolvedValue({
			id: 't1',
			posts: { count: 12, items: [{ id: 'p11' }, { id: 'p12' }] }
		});
		clientInstance.markThreadRead.mockResolvedValue({ isUnread: false });

		await getThread(makeRequest({ params: { threadId: 't1', page: '2' } } as never));

		expect(clientInstance.markThreadRead).toHaveBeenCalledWith('t1', 'p12');
	});

	it('does not mark anything read when the page holds no post', async () => {
		clientInstance.getThread.mockResolvedValue({ id: 't1', posts: { count: 0, items: [] } });

		await getThread(makeRequest({ params: { threadId: 't1', page: '1' } } as never));

		expect(clientInstance.markThreadRead).not.toHaveBeenCalled();
	});

	it('still returns the thread when marking it read fails', async () => {
		const thread = { id: 't1', posts: { count: 1, items: [{ id: 'p1' }] } };
		clientInstance.getThread.mockResolvedValue(thread);
		clientInstance.markThreadRead.mockRejectedValue(new Error('boom'));

		const result = await getThread(makeRequest({ params: { threadId: 't1', page: '1' } } as never));

		expect(result).toBe(thread);
		expect(LOGGER.error).toHaveBeenCalled();
	});

	it('creates a thread in the section the player picked', async () => {
		clientInstance.createThread.mockResolvedValue({ type: 'ForumThread' });

		await createThread(makeRequest({ body: { sectionId: 'drpg_main', title: 'Titre', message: 'corps' } } as never));

		expect(clientInstance.createThread).toHaveBeenCalledWith('drpg_main', 'Titre', 'corps');
	});

	it('replies to the thread named in the route', async () => {
		clientInstance.replyToThread.mockResolvedValue({ type: 'ForumPost' });

		await replyToThread(makeRequest({ params: { threadId: 't1' }, body: { message: 'ok' } } as never));

		expect(clientInstance.replyToThread).toHaveBeenCalledWith('t1', 'ok');
	});

	it('reads the source before editing, and sends that revision id', async () => {
		clientInstance.getPostSource.mockResolvedValue({ revisions: { count: 9, items: [{ id: 'rev9' }] } });
		clientInstance.updatePost.mockResolvedValue({ type: 'ForumPost' });

		await updatePost(makeRequest({ params: { postId: 'post1' }, body: { content: 'v2' } } as never));

		expect(clientInstance.getPostSource).toHaveBeenCalledWith('post1');
		expect(clientInstance.updatePost).toHaveBeenCalledWith('post1', 'rev9', 'v2', null);
	});

	it('refuses to edit when no revision id can be read', async () => {
		clientInstance.getPostSource.mockResolvedValue({ revisions: { count: 0, items: [] } });

		await expect(
			updatePost(makeRequest({ params: { postId: 'post1' }, body: { content: 'v2' } } as never))
		).rejects.toThrow('eternaltwinPostRevisionUnavailable');
		expect(clientInstance.updatePost).not.toHaveBeenCalled();
	});
});
