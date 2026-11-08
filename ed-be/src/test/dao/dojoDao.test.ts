import { describe, it, expect, vi, beforeEach } from 'vitest';

const tx = {
	dojo: { updateMany: vi.fn() },
	dojoTeam: { deleteMany: vi.fn(), createMany: vi.fn() },
	dojoOpponents: { deleteMany: vi.fn(), createMany: vi.fn() }
};

vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn((fn: (client: unknown) => unknown) => fn(tx)),
		dojo: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'd1' }) }
	}
}));

import { replaceMyTeamDao } from '../../dao/dojoDao.js';

const startOfDay = new Date('2026-11-08T00:00:00');

describe('replaceMyTeamDao', () => {
	beforeEach(() => vi.clearAllMocks());

	it('replaces the team only while waves are left and once a day when a team exists', async () => {
		tx.dojo.updateMany.mockResolvedValue({ count: 1 });
		await expect(replaceMyTeamDao([1], [2], 'd1', 5, startOfDay)).resolves.toEqual({ id: 'd1' });
		expect(tx.dojo.updateMany).toHaveBeenCalledWith({
			where: {
				id: 'd1',
				dailyReset: { lt: 5 },
				OR: [{ team: { none: {} } }, { teamUpdate: null }, { teamUpdate: { lt: startOfDay } }]
			},
			data: { teamUpdate: expect.any(Date) }
		});
		expect(tx.dojoTeam.createMany).toHaveBeenCalled();
	});

	it('keeps the current team and opponents when the condition fails', async () => {
		tx.dojo.updateMany.mockResolvedValue({ count: 0 });
		await expect(replaceMyTeamDao([1], [2], 'd1', 5, startOfDay)).resolves.toBeNull();
		expect(tx.dojoTeam.deleteMany).not.toHaveBeenCalled();
		expect(tx.dojoOpponents.deleteMany).not.toHaveBeenCalled();
	});
});
