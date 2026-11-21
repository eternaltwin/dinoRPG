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

	// Since 8ac0b075e, dinoz placed on the clan championship board can still fight in the dojo
	it('keeps dinoz placed on the clan championship board in the team picker, but not frozen ones', async () => {
		await getPlayerDinozInformationForTeam('p1');
		const args = vi.mocked(prisma.player.findUniqueOrThrow).mock.calls[0][0] as never as {
			select: { dinoz: { where: { OR: { unavailableReason?: { not: { in: UnavailableReason[] } } }[] } } };
		};
		const notIn = args.select.dinoz.where.OR[1].unavailableReason?.not.in ?? [];
		expect(notIn).not.toContain(UnavailableReason.clanChampionship);
		expect(notIn).toContain(UnavailableReason.frozen);
	});
});
