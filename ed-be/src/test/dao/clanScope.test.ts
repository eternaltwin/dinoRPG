import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		player: { findUnique: vi.fn(), update: vi.fn() },
		clan: { findUnique: vi.fn() },
		clanMember: { findFirst: vi.fn(), delete: vi.fn() },
		clanHistory: { create: vi.fn() },
		clanPage: { deleteMany: vi.fn(), updateMany: vi.fn(), findUniqueOrThrow: vi.fn() }
	}
}));
vi.mock('../../context.js', () => ({ GLOBAL: { config: {} }, LOGGER: { log: vi.fn(), error: vi.fn() } }));

import { prisma } from '../../prisma.js';
import { deleteClanPageRequest, excludeClanMemberRequest, updateClanPageRequest } from '../../dao/clansDao.js';

const p = prisma as never as {
	player: { findUnique: ReturnType<typeof vi.fn> };
	clan: { findUnique: ReturnType<typeof vi.fn> };
	clanMember: { findFirst: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
	clanPage: {
		deleteMany: ReturnType<typeof vi.fn>;
		updateMany: ReturnType<typeof vi.fn>;
		findUniqueOrThrow: ReturnType<typeof vi.fn>;
	};
};

beforeEach(() => {
	vi.clearAllMocks();
	p.player.findUnique.mockResolvedValue({ name: 'Officer' });
});

describe('excludeClanMemberRequest', () => {
	it('refuses a member of another clan than the one the right was checked on', async () => {
		p.clanMember.findFirst.mockResolvedValue(null);
		await expect(excludeClanMemberRequest(9, 1, 'officer')).rejects.toThrow('Member not found in this clan');
		expect(p.clanMember.findFirst).toHaveBeenCalledWith({ where: { id: 9, clanId: 1 } });
		expect(p.clanMember.delete).not.toHaveBeenCalled();
	});

	it('never excludes the leader', async () => {
		p.clanMember.findFirst.mockResolvedValue({ id: 9, clanId: 1, playerId: 'leader' });
		p.clan.findUnique.mockResolvedValue({ id: 1, leaderId: 'leader' });
		await excludeClanMemberRequest(9, 1, 'officer');
		expect(p.clanMember.delete).not.toHaveBeenCalled();
	});
});

describe('clan pages', () => {
	it('deletes a page of the clan only', async () => {
		p.clanPage.deleteMany.mockResolvedValue({ count: 0 });
		await expect(deleteClanPageRequest(5, 1)).rejects.toThrow('Page not found in this clan');
		expect(p.clanPage.deleteMany).toHaveBeenCalledWith({ where: { id: 5, clanId: 1, home: false } });
		p.clanPage.deleteMany.mockResolvedValue({ count: 1 });
		await expect(deleteClanPageRequest(5, 1)).resolves.toEqual({ id: 5 });
	});

	it('updates a page of the clan only', async () => {
		p.clanPage.updateMany.mockResolvedValue({ count: 0 });
		await expect(updateClanPageRequest(5, 1, 'n', 'c', true)).rejects.toThrow('Page not found in this clan');
		expect(p.clanPage.updateMany).toHaveBeenCalledWith({
			where: { id: 5, clanId: 1 },
			data: { name: 'n', content: 'c', public: true }
		});
		expect(p.clanPage.findUniqueOrThrow).not.toHaveBeenCalled();
	});
});
