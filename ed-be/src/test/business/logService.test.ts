import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/logDao.js', () => ({
	getLogList: vi.fn(),
	getLogListAll: vi.fn(),
	getLogListByDate: vi.fn(),
	getWarLogList: vi.fn()
}));

import * as logDao from '../../dao/logDao.js';
import { getAllLogs, getLogs, getLogsByDate, getWarLogs } from '../../business/logService.js';

const req = (params = {}) => makeRequest({ params });

beforeEach(() => vi.clearAllMocks());

describe('logService', () => {
	it('getAllLogs', async () => {
		vi.mocked(logDao.getLogListAll).mockResolvedValue(['all'] as never);
		expect(await getAllLogs()).toEqual(['all']);
	});
	it('getLogs parses null params', async () => {
		vi.mocked(logDao.getLogList).mockResolvedValue(['l'] as never);
		await getLogs(req({ page: '2', type: 'null', playerId: 'null', dinozId: 'null' }));
		expect(logDao.getLogList).toHaveBeenCalledWith(2, undefined, undefined, undefined);
	});
	it('getLogs passes real params', async () => {
		vi.mocked(logDao.getLogList).mockResolvedValue(['l'] as never);
		await getLogs(req({ page: '1', type: 'GoldWon', playerId: 'p', dinozId: '3' }));
		expect(logDao.getLogList).toHaveBeenCalledWith(1, 'GoldWon', 'p', 3);
	});
	it('getLogsByDate groups by hour for same day', async () => {
		const now = new Date();
		vi.mocked(logDao.getLogListByDate).mockResolvedValue([
			{ createdAt: now, type: 'GoldWon', values: ['10'] },
			{ createdAt: now, type: 'ItemBought', values: ['1', '2'] },
			{ createdAt: now, type: 'Other', values: [] }
		] as never);
		const result = await getLogsByDate(req({ type: 'null', fromDate: now.toISOString() }));
		expect(Object.keys(result).length).toBeGreaterThan(0);
	});
	it('getLogsByDate groups by day for a wide range', async () => {
		const old = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
		vi.mocked(logDao.getLogListByDate).mockResolvedValue([
			{ createdAt: old, type: 'XPEarned', values: ['7'] }
		] as never);
		const result = await getLogsByDate(req({ type: 'XPEarned', fromDate: old.toISOString() }));
		expect(Object.values(result)[0]).toBe(7);
	});
	it('getWarLogs', async () => {
		vi.mocked(logDao.getWarLogList).mockResolvedValue(['w'] as never);
		await getWarLogs(req({ page: '1', clanId: 'null' }));
		expect(logDao.getWarLogList).toHaveBeenCalledWith(1, undefined);
	});
});
