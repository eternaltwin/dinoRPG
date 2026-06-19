import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/rankingDao.js', () => ({
	getPlayerPositionDAO: vi.fn(),
	getPlayersAverageRanking: vi.fn(),
	getPlayersCompletionRanking: vi.fn(),
	getPlayersDojoRanking: vi.fn(),
	getPlayersSumRanking: vi.fn()
}));
vi.mock('../../dao/trackingDao.js', () => ({ getEveryStatTop3: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ getWarHistory: vi.fn() }));

import * as rankingDao from '../../dao/rankingDao.js';
import { getEveryStatTop3 } from '../../dao/trackingDao.js';
import { getWarHistory } from '../../dao/clansDao.js';
import { getRanking, getPlayerPosition, getStatRankings, getWarHistoryRanking } from '../../business/rankingService.js';

const req = (params = {}) => makeRequest({ params });

beforeEach(() => vi.clearAllMocks());

describe('getRanking', () => {
	it('classic', async () => {
		vi.mocked(rankingDao.getPlayersSumRanking).mockResolvedValue(['s'] as never);
		expect(await getRanking(req({ page: '1', sort: 'classic' }))).toEqual(['s']);
	});
	it('average', async () => {
		vi.mocked(rankingDao.getPlayersAverageRanking).mockResolvedValue(['a'] as never);
		expect(await getRanking(req({ page: '1', sort: 'average' }))).toEqual(['a']);
	});
	it('completion', async () => {
		vi.mocked(rankingDao.getPlayersCompletionRanking).mockResolvedValue(['c'] as never);
		expect(await getRanking(req({ page: '1', sort: 'completion' }))).toEqual(['c']);
	});
	it('dojo maps worth', async () => {
		vi.mocked(rankingDao.getPlayersDojoRanking).mockResolvedValue([
			{ dojo: 10, player: { id: 'p', name: 'n', Dojo: { DojoChallengeHistory: [{ victory: true }, { victory: false }] } } }
		] as never);
		const result = await getRanking(req({ page: '1', sort: 'dojo' }));
		expect(result[0].player.worth).toBe(50);
	});
	it('default', async () => {
		vi.mocked(rankingDao.getPlayersSumRanking).mockResolvedValue(['d'] as never);
		expect(await getRanking(req({ page: '1', sort: 'x' }))).toEqual(['d']);
	});
});

describe('other ranking endpoints', () => {
	it('getPlayerPosition', async () => {
		vi.mocked(rankingDao.getPlayerPositionDAO).mockResolvedValue(5 as never);
		expect(await getPlayerPosition(req({ playerId: 'p' }))).toBe(5);
	});
	it('getStatRankings', async () => {
		vi.mocked(getEveryStatTop3).mockResolvedValue(['top'] as never);
		expect(await getStatRankings()).toEqual(['top']);
	});
	it('getWarHistoryRanking', async () => {
		vi.mocked(getWarHistory).mockResolvedValue(['war'] as never);
		expect(await getWarHistoryRanking(req({ page: '2' }))).toEqual(['war']);
	});
});
