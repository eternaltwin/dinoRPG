import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../context.js', () => ({
	GLOBAL: { config: { isProduction: false, administrator: 'admin' } },
	LOGGER: { log: vi.fn(), error: vi.fn() }
}));
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		$executeRaw: vi.fn(),
		player: { updateManyAndReturn: vi.fn() },
		ranking: { updateMany: vi.fn() }
	}
}));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({}));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../utils/tournamentManager.js', () => ({ default: {} }));

import { prisma } from '../../prisma.js';
import { GLOBAL } from '../../context.js';
import { auth } from '../../dao/playerDao.js';
import { truncateAll } from '../../business/adminService.js';

const p = prisma as any;

beforeEach(() => {
	vi.clearAllMocks();
	(GLOBAL.config as { isProduction: boolean }).isProduction = false;
	vi.mocked(auth).mockResolvedValue({ id: 'admin' } as never);
	p.$transaction.mockImplementation(async (fn: any) => fn(p));
	p.player.updateManyAndReturn.mockResolvedValue([]);
});

describe('truncateAll', () => {
	it('is refused in production, before any write', async () => {
		(GLOBAL.config as { isProduction: boolean }).isProduction = true;
		await expect(truncateAll(makeRequest())).rejects.toThrow('Forbidden in production');
		expect(p.$transaction).not.toHaveBeenCalled();
		expect(p.$executeRaw).not.toHaveBeenCalled();
	});

	it('wipes the game inside one interactive transaction', async () => {
		await truncateAll(makeRequest());
		expect(p.$transaction).toHaveBeenCalledOnce();
		expect(p.$executeRaw).toHaveBeenCalled();
		// No raw BEGIN/COMMIT, which could each run on another connection of the pool
		const statements = p.$executeRaw.mock.calls.map((c: [TemplateStringsArray]) => c[0].join(''));
		expect(statements.some((sql: string) => /BEGIN|COMMIT/.test(sql))).toBe(false);
	});

	it('stops before resetting the players when the wipe fails', async () => {
		p.$transaction.mockRejectedValue(new Error('deadlock'));
		await expect(truncateAll(makeRequest())).rejects.toThrow('deadlock');
		expect(p.player.updateManyAndReturn).not.toHaveBeenCalled();
	});
});
