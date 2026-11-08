import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../prisma.js', () => ({ prisma: { player: { findUnique: vi.fn() } } }));

import { prisma } from '../../prisma.js';
import { ACCOUNT_DELETION_REPORT_GRACE_DAYS, checkBeforeDeletion, getPlayerExportData } from '../../dao/playerDao.js';

type Args = { where: { id: string }; select?: Record<string, any>; omit?: Record<string, boolean> };
const lastArgs = () => vi.mocked(prisma.player.findUnique).mock.calls.at(-1)?.[0] as never as Args;

describe('checkBeforeDeletion', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(prisma.player.findUnique).mockResolvedValue({ targetedCases: [] } as never);
	});

	it('only counts the open reports of the grace period, so a closed or old report never blocks the deletion', async () => {
		await checkBeforeDeletion('p1');
		const where = lastArgs().select?.targetedCases.where;
		expect(where.sorted).toBeNull();
		const days = (Date.now() - (where.createdAt.gte as Date).getTime()) / 86_400_000;
		expect(Math.round(days)).toBe(ACCOUNT_DELETION_REPORT_GRACE_DAYS);
	});
});

describe('getPlayerExportData', () => {
	it('reads the requested player only and leaves the credentials out', async () => {
		vi.mocked(prisma.player.findUnique).mockResolvedValue({ id: 'p1' } as never);
		await getPlayerExportData('p1');
		const args = lastArgs() as Args & { include: Record<string, unknown> };
		expect(args.where).toEqual({ id: 'p1' });
		expect(args.omit).toEqual({ connexionToken: true });
		expect(args.include).not.toHaveProperty('eternaltwinToken');
		expect(args.include).not.toHaveProperty('targetedCases');
	});
});
