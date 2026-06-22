import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import dayjs from 'dayjs';

vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getLBPlayer: vi.fn(),
	getLBResponseInformation: vi.fn(),
	setPlayer: vi.fn()
}));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import * as playerDao from '../../dao/playerDao.js';
import { increaseItemQuantity } from '../../dao/playerItemDao.js';
import fetch from 'node-fetch';
import { checkPlayerLB, checkLB } from '../../business/eternaltwinService.js';

const req = (params = {}) => makeRequest({ params });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('checkPlayerLB', () => {
	it('throws when player missing', async () => {
		vi.mocked(playerDao.getLBPlayer).mockResolvedValue(null as never);
		await expect(checkPlayerLB(req({ uuid: 'u' }))).rejects.toThrow("doesn't exist");
	});
	it('returns false when last login is not today', async () => {
		vi.mocked(playerDao.getLBPlayer).mockResolvedValue({ lastLogin: new Date('2000-01-01'), dinoz: [{ remaining: 0 }] } as never);
		expect(await checkPlayerLB(req({ uuid: 'u' }))).toBe(false);
	});
	it('returns false when no dinoz', async () => {
		vi.mocked(playerDao.getLBPlayer).mockResolvedValue({ lastLogin: new Date(), dinoz: [] } as never);
		expect(await checkPlayerLB(req({ uuid: 'u' }))).toBe(false);
	});
	it('returns true when all actions used today', async () => {
		vi.mocked(playerDao.getLBPlayer).mockResolvedValue({ lastLogin: dayjs().toDate(), dinoz: [{ remaining: 0 }] } as never);
		expect(await checkPlayerLB(req({ uuid: 'u' }))).toBe(true);
	});
});

describe('checkLB', () => {
	it('throws when player missing', async () => {
		vi.mocked(playerDao.getLBResponseInformation).mockResolvedValue(null as never);
		await expect(checkLB(req())).rejects.toThrow("doesn't exist");
	});
	it('throws when already claimed', async () => {
		vi.mocked(playerDao.getLBResponseInformation).mockResolvedValue({ labruteDone: true, _count: { dinoz: 3 } } as never);
		await expect(checkLB(req())).rejects.toThrow('alreadyClaimed');
	});
	it('grants the reward when LB is done', async () => {
		vi.mocked(playerDao.getLBResponseInformation).mockResolvedValue({ labruteDone: false, _count: { dinoz: 6 } } as never);
		vi.mocked(fetch as never).mockResolvedValue({ text: vi.fn().mockResolvedValue('true') } as never);
		const result = await checkLB(req());
		expect(increaseItemQuantity).toHaveBeenCalled();
		expect(result.quantity).toBe(2);
	});
	it('throws when no brutes found', async () => {
		vi.mocked(playerDao.getLBResponseInformation).mockResolvedValue({ labruteDone: false, _count: { dinoz: 3 } } as never);
		vi.mocked(fetch as never).mockResolvedValue({ text: vi.fn().mockResolvedValue('No brutes found') } as never);
		await expect(checkLB(req())).rejects.toThrow('noBruteFound');
	});
	it('throws when not done', async () => {
		vi.mocked(playerDao.getLBResponseInformation).mockResolvedValue({ labruteDone: false, _count: { dinoz: 3 } } as never);
		vi.mocked(fetch as never).mockResolvedValue({ text: vi.fn().mockResolvedValue('false') } as never);
		await expect(checkLB(req())).rejects.toThrow('needToDoAllAction');
	});
});
