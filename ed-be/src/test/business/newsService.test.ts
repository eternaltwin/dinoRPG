import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../context.js', () => ({
	DISCORD: { sendNewsNotification: vi.fn() },
	LOGGER: { log: vi.fn(), error: vi.fn(), info: vi.fn() }
}));
vi.mock('../../dao/newsDao.js', () => ({
	createNews: vi.fn(),
	getBatchOfNews: vi.fn(),
	getNewsIllus: vi.fn(),
	updateAnyNews: vi.fn(),
	getNewsDate: vi.fn(),
	hasPlayerLikedNews: vi.fn(),
	likeNews: vi.fn(),
	unlikeNews: vi.fn(),
	getAllNewsFromDB: vi.fn(),
	deleteAnyNews: vi.fn(),
	getNewsDetails: vi.fn()
}));
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	noStrictAuth: vi.fn()
}));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn() }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		poll: { create: vi.fn(), update: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
		pollOption: { create: vi.fn() },
		pollVote: { upsert: vi.fn() },
		$transaction: vi.fn()
	}
}));

import * as newsDao from '../../dao/newsDao.js';
import { auth, noStrictAuth } from '../../dao/playerDao.js';
import { prisma } from '../../prisma.js';
import { scheduleJob } from 'node-schedule';
import {
	postNews,
	createPoll,
	expirePoll,
	schedulePollExpiration,
	getNews,
	getAllNews,
	getNewsAdmin,
	updateNews,
	deleteNews,
	getNewsIllustration,
	getNewsCreatedDate,
	selectPollOption,
	toggleLikeNews,
	createTranslatedNews
} from '../../business/newsService.js';
import { Lang, NewsType } from '@drpg/prisma';
import { DISCORD } from '../../context.js';

const req = (params = {}, body = {}, file?: unknown) => makeRequest({ params, body, file } as never);

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
	vi.mocked(noStrictAuth).mockResolvedValue({ id: 'p1' } as never);
});

describe('postNews', () => {
	it('creates a news and sends a discord notification', async () => {
		vi.mocked(newsDao.createNews).mockResolvedValue({ id: 1 } as never);
		const result = await postNews(
			req({ title: 't' }, { frenchTitle: 'fr', frenchText: 'txt' }, { buffer: Buffer.from('x') })
		);
		expect(newsDao.createNews).toHaveBeenCalled();
		expect(result).toEqual({ id: 1 });
	});
});

describe('createTranslatedNews', () => {
	it('creates translated news and sends a discord notification', async () => {
		vi.mocked(newsDao.createNews).mockResolvedValue({ id: 1, frenchTitle: 'test', frenchText: 'test' } as never);
		await createTranslatedNews(
			't',
			NewsType.announce,
			'newsTitle',
			{ [Lang.fr]: {} } as Record<Lang, Record<string, unknown>>,
			'newsCorpus',
			{ [Lang.es]: {} } as Record<Lang, Record<string, unknown>>,
			false
		);
		expect(newsDao.createNews).toHaveBeenCalled();
		expect(DISCORD.sendNewsNotification).not.toHaveBeenCalled();
	});
	it('creates translated news without a discord notification', async () => {
		vi.mocked(newsDao.createNews).mockResolvedValue({ id: 1, frenchTitle: 'test', frenchText: 'test' } as never);
		console.log(`Log on test`);
		await createTranslatedNews(
			't',
			NewsType.announce,
			'newsTitle',
			{} as Record<Lang, Record<string, unknown>>,
			'newsCorpus',
			{} as Record<Lang, Record<string, unknown>>,
			true
		);
		expect(newsDao.createNews).toHaveBeenCalled();
		expect(DISCORD.sendNewsNotification).toHaveBeenCalled();
	});
});

describe('createPoll', () => {
	it('creates a poll with options and schedules its expiration', async () => {
		vi.mocked(newsDao.createNews).mockResolvedValue({ id: 5 } as never);
		vi.mocked(prisma.$transaction).mockImplementation(async (cb: never) =>
			(cb as unknown as (tx: unknown) => unknown)({
				poll: { create: vi.fn().mockResolvedValue({ id: 9, endDate: new Date() }) },
				pollOption: { create: vi.fn().mockResolvedValue({ id: 1 }) }
			})
		);
		await createPoll(
			req(
				{ title: 't' },
				{ frenchTitle: 'fr', frenchText: 'txt', options: JSON.stringify([{ optionText: 'a' }, { optionText: 'b' }]) }
			)
		);
		expect(scheduleJob).toHaveBeenCalled();
	});

	it('uses a provided valid endDate', async () => {
		vi.mocked(newsDao.createNews).mockResolvedValue({ id: 5 } as never);
		vi.mocked(prisma.$transaction).mockImplementation(async (cb: never) =>
			(cb as unknown as (tx: unknown) => unknown)({
				poll: { create: vi.fn().mockResolvedValue({ id: 9, endDate: new Date() }) },
				pollOption: { create: vi.fn().mockResolvedValue({ id: 1 }) }
			})
		);
		await createPoll(
			req(
				{ title: 't' },
				{
					frenchTitle: 'fr',
					frenchText: 'txt',
					endDate: '2030-01-01',
					options: JSON.stringify([
						{ optionText: 'a', orderIndex: 0 },
						{ optionText: 'b', orderIndex: 1 }
					])
				}
			)
		);
		expect(scheduleJob).toHaveBeenCalled();
	});

	it('throws when fewer than 2 options', async () => {
		vi.mocked(newsDao.createNews).mockResolvedValue({ id: 5 } as never);
		await expect(
			createPoll(
				req({ title: 't' }, { frenchTitle: 'fr', frenchText: 'txt', options: JSON.stringify([{ optionText: 'a' }]) })
			)
		).rejects.toThrow('No enough options');
	});

	it('throws when an option is empty', async () => {
		vi.mocked(newsDao.createNews).mockResolvedValue({ id: 5 } as never);
		await expect(
			createPoll(
				req(
					{ title: 't' },
					{ frenchTitle: 'fr', frenchText: 'txt', options: JSON.stringify([{ optionText: '  ' }, { optionText: 'b' }]) }
				)
			)
		).rejects.toThrow('empty');
	});
});

describe('expirePoll / schedulePollExpiration', () => {
	it('expirePoll deactivates the poll', async () => {
		await expirePoll(3);
		expect(prisma.poll.update).toHaveBeenCalledWith({ where: { id: 3 }, data: { isActive: false } });
	});

	it('schedulePollExpiration expires outdated and schedules remaining polls', async () => {
		const past = new Date(Date.now() - 100000);
		const future = new Date(Date.now() + 1000000);
		vi.mocked(prisma.poll.findMany).mockResolvedValue([
			{ id: 1, endDate: past },
			{ id: 2, endDate: future }
		] as never);
		await schedulePollExpiration();
		expect(prisma.poll.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isActive: false } });
		expect(scheduleJob).toHaveBeenCalled();
	});
});

describe('read endpoints', () => {
	it('getNews maps batch with totalVote', async () => {
		vi.mocked(newsDao.getBatchOfNews).mockResolvedValue([
			{ id: 1, poll: { votes: [{}, {}] } },
			{ id: 2, poll: null }
		] as never);
		const result = await getNews(req({ page: '0' }));
		expect(result[0].totalVote).toBe(2);
		expect(result[1].totalVote).toBe(0);
	});

	it('getAllNews returns all news', async () => {
		vi.mocked(newsDao.getAllNewsFromDB).mockResolvedValue([{ id: 1 }] as never);
		expect(await getAllNews()).toEqual([{ id: 1 }]);
	});

	it('getNewsAdmin returns details', async () => {
		vi.mocked(newsDao.getNewsDetails).mockResolvedValue({ id: 7 } as never);
		expect(await getNewsAdmin(req({ id: '7' }))).toEqual({ id: 7 });
	});

	it('getNewsIllustration returns the image', async () => {
		vi.mocked(newsDao.getNewsIllus).mockResolvedValue({ image: 'img' } as never);
		expect(await getNewsIllustration(req({ id: '1' }) as never)).toBe('img');
	});

	it('getNewsCreatedDate returns the created date', async () => {
		const d = new Date();
		vi.mocked(newsDao.getNewsDate).mockResolvedValue({ createdDate: d } as never);
		expect(await getNewsCreatedDate(req({ id: '1' }) as never)).toBe(d);
	});
});

describe('updateNews / deleteNews', () => {
	it('updateNews delegates to the dao', async () => {
		await updateNews(req({ id: '1' }, { frenchTitle: 'x' }, { buffer: Buffer.from('x') }));
		expect(newsDao.updateAnyNews).toHaveBeenCalledWith(1, expect.objectContaining({ frenchTitle: 'x' }));
	});

	it('deleteNews delegates to the dao', async () => {
		await deleteNews(req({ id: '2' }));
		expect(newsDao.deleteAnyNews).toHaveBeenCalledWith(2);
	});
});

describe('selectPollOption', () => {
	const poll = (overrides = {}) => ({
		isActive: true,
		options: [{ id: 10 }, { id: 11 }],
		votes: [],
		...overrides
	});

	it('upserts a vote for a valid option', async () => {
		vi.mocked(prisma.poll.findFirst).mockResolvedValue(poll() as never);
		const result = await selectPollOption(req({ id: '1', option: '10' }));
		expect(prisma.pollVote.upsert).toHaveBeenCalled();
		expect(result).toEqual({ code: expect.anything() });
	});

	it('returns OK without upsert when the same option is already chosen', async () => {
		vi.mocked(prisma.poll.findFirst).mockResolvedValue(
			poll({ votes: [{ playerId: 'p1', pollOptionId: 10 }] }) as never
		);
		await selectPollOption(req({ id: '1', option: '10' }));
		expect(prisma.pollVote.upsert).not.toHaveBeenCalled();
	});

	it('throws when poll does not exist', async () => {
		vi.mocked(prisma.poll.findFirst).mockResolvedValue(null as never);
		await expect(selectPollOption(req({ id: '1', option: '10' }))).rejects.toThrow("didn't exist");
	});

	it('throws when poll is over', async () => {
		vi.mocked(prisma.poll.findFirst).mockResolvedValue(poll({ isActive: false }) as never);
		await expect(selectPollOption(req({ id: '1', option: '10' }))).rejects.toThrow('is over');
	});

	it('throws when option is not a possibility', async () => {
		vi.mocked(prisma.poll.findFirst).mockResolvedValue(poll() as never);
		await expect(selectPollOption(req({ id: '1', option: '99' }))).rejects.toThrow('not a possibility');
	});
});

describe('toggleLikeNews', () => {
	it('unlikes when already liked', async () => {
		vi.mocked(newsDao.hasPlayerLikedNews).mockResolvedValue(true as never);
		await toggleLikeNews(req({ id: '1' }));
		expect(newsDao.unlikeNews).toHaveBeenCalledWith(1, 'p1');
	});

	it('likes when not liked', async () => {
		vi.mocked(newsDao.hasPlayerLikedNews).mockResolvedValue(false as never);
		await toggleLikeNews(req({ id: '1' }));
		expect(newsDao.likeNews).toHaveBeenCalledWith(1, 'p1');
	});
});
