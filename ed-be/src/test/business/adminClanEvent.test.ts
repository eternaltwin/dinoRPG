import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		$queryRaw: vi.fn(),
		clanEvent: { create: vi.fn(), findFirst: vi.fn() }
	}
}));
vi.mock('../../business/clanChampionshipService.js', () => ({ isClanInActiveChampionship: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ deleteClanRequest: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../utils/tournamentManager.js', () => ({ default: { postponeNextTournamentCreation: vi.fn() } }));

import { prisma } from '../../prisma.js';
import { deleteClanRequest } from '../../dao/clansDao.js';
import { isClanInActiveChampionship } from '../../business/clanChampionshipService.js';
import { deleteClanAdmin, startClanWarEvent } from '../../business/adminService.js';

const p = prisma as any;

beforeEach(() => {
	vi.resetAllMocks();
	p.$transaction.mockImplementation(async (fn: any) => fn(p));
	p.clanEvent.findFirst.mockResolvedValue(null);
});

describe('startClanWarEvent', () => {
	it('takes the advisory lock inside the transaction before the overlap check and the create', async () => {
		await startClanWarEvent(makeRequest({ body: { start: '2030-01-07', duration: 1, places: [] } as any }));
		const lock = p.$queryRaw.mock.invocationCallOrder[0];
		expect(p.$transaction.mock.invocationCallOrder[0]).toBeLessThan(lock);
		expect(lock).toBeLessThan(p.clanEvent.findFirst.mock.invocationCallOrder[0]);
		expect(lock).toBeLessThan(p.clanEvent.create.mock.invocationCallOrder[0]);
	});
});

describe('deleteClanAdmin', () => {
	it('refuses to delete a clan registered in a championship', async () => {
		vi.mocked(isClanInActiveChampionship).mockResolvedValue(true);
		await expect(deleteClanAdmin(7, 'admin')).rejects.toThrow('clanChampionship.registeredNoDelete');
		expect(deleteClanRequest).not.toHaveBeenCalled();
	});
});
