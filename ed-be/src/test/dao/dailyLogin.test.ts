import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Item } from '@drpg/core/models/item/ItemList';

vi.mock('../../prisma.js', () => ({
	prisma: {
		player: { updateMany: vi.fn() },
		dinoz: { findMany: vi.fn() }
	}
}));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ updateDinoz: vi.fn() }));
vi.mock('../../dao/rankingDao.js', () => ({ updateCompletion: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../utils/boxesLogic.js', () => ({ calculatePlayerCompletion: vi.fn().mockResolvedValue(0) }));
vi.mock('../../utils/gameConfig.js', () => ({ gameConfig: () => ({ general: { dailyGridRewards: 3 } }) }));

import { prisma } from '../../prisma.js';
import { increaseItemQuantity } from '../../dao/playerItemDao.js';
import { claimDailyLogin, grantDailyLoginBonus } from '../../dao/playerDao.js';

const user = { id: 'p1', name: 'Bob', matelasseur: false };

describe('daily login bonus', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(prisma.dinoz.findMany).mockResolvedValue([] as never);
	});

	it('opens the day only while lastLogin is before today', async () => {
		vi.mocked(prisma.player.updateMany).mockResolvedValue({ count: 1 } as never);
		expect(await claimDailyLogin('p1')).toBe(true);
		const args = vi.mocked(prisma.player.updateMany).mock.calls[0][0] as never as {
			where: { id: string; lastLogin: { lt: Date } };
		};
		expect(args.where.id).toBe('p1');
		expect(args.where.lastLogin.lt.getHours()).toBe(0);
		expect(args.where.lastLogin.lt.getMinutes()).toBe(0);
	});

	it('grants the daily ticket to the request that opens the day', async () => {
		vi.mocked(prisma.player.updateMany).mockResolvedValue({ count: 1 } as never);
		await grantDailyLoginBonus(user);
		expect(increaseItemQuantity).toHaveBeenCalledWith('p1', Item.DAILY_TICKET, 1);
	});

	it('grants nothing to a concurrent request once the day is open', async () => {
		vi.mocked(prisma.player.updateMany).mockResolvedValue({ count: 0 } as never);
		await grantDailyLoginBonus(user);
		expect(increaseItemQuantity).not.toHaveBeenCalled();
		expect(prisma.dinoz.findMany).not.toHaveBeenCalled();
	});
});
