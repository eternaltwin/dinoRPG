import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../prisma.js', () => ({
	prisma: {
		player: { findUniqueOrThrow: vi.fn() }
	}
}));

import { prisma } from '../../prisma.js';
import { getPlayerDinozInformationForTeam } from '../../dao/playerDao.js';
import { UnavailableReason } from '@drpg/prisma';

describe('getPlayerDinozInformationForTeam', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(prisma.player.findUniqueOrThrow).mockResolvedValue({ dinoz: [] } as never);
	});

	it('excludes dinoz locked on the clan championship board from the team picker', async () => {
		await getPlayerDinozInformationForTeam('p1');
		const args = vi.mocked(prisma.player.findUniqueOrThrow).mock.calls[0][0] as never as {
			select: { dinoz: { where: { OR: { unavailableReason?: { not: { in: UnavailableReason[] } } }[] } } };
		};
		const notIn = args.select.dinoz.where.OR[1].unavailableReason?.not.in ?? [];
		expect(notIn).toContain(UnavailableReason.clanChampionship);
		expect(notIn).toContain(UnavailableReason.frozen);
	});
});
