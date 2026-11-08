import { describe, it, expect, vi, beforeEach } from 'vitest';

const tx = {
	playerIngredient: { updateMany: vi.fn(), deleteMany: vi.fn() },
	player: { update: vi.fn() },
	clanIngredient: { upsert: vi.fn() },
	clanMember: { updateMany: vi.fn() },
	clan: { update: vi.fn() }
};

vi.mock('../../prisma.js', () => ({
	prisma: { $transaction: vi.fn((fn: (client: unknown) => unknown) => fn(tx)) }
}));
vi.mock('../../context.js', () => ({ GLOBAL: { config: {} }, LOGGER: { log: vi.fn(), error: vi.fn() } }));

import { sellIngredients } from '../../dao/playerIngredientDao.js';
import { donateIngredientsToClan } from '../../dao/clansDao.js';
import { parseQuantityLines } from '../../utils/quantityLines.js';

beforeEach(() => {
	vi.clearAllMocks();
	tx.playerIngredient.updateMany.mockResolvedValue({ count: 1 });
	tx.clanMember.updateMany.mockResolvedValue({ count: 1 });
});

describe('sellIngredients', () => {
	it('removes the ingredients by conditional writes, then credits the gold', async () => {
		expect(await sellIngredients('p1', [{ ingredientId: 3, quantity: 2 }], 50)).toBe(true);
		expect(tx.playerIngredient.updateMany).toHaveBeenCalledWith({
			where: { ingredientId: 3, playerId: 'p1', quantity: { gte: 2 } },
			data: { quantity: { decrement: 2 } }
		});
		expect(tx.player.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { money: { increment: 50 } } });
	});

	it('credits no gold when a line is missing', async () => {
		tx.playerIngredient.updateMany.mockResolvedValue({ count: 0 });
		expect(await sellIngredients('p1', [{ ingredientId: 3, quantity: 2 }], 50)).toBe(false);
		expect(tx.player.update).not.toHaveBeenCalled();
	});
});

describe('donateIngredientsToClan', () => {
	it('credits neither the treasure nor the contribution when an ingredient is missing', async () => {
		tx.playerIngredient.updateMany.mockResolvedValue({ count: 0 });
		expect(await donateIngredientsToClan('p1', 1, [{ ingredientId: 3, quantity: 2 }], 40)).toBe(false);
		expect(tx.clan.update).not.toHaveBeenCalled();
		expect(tx.clanMember.updateMany).not.toHaveBeenCalled();
	});

	it('credits nothing when the donor left the clan', async () => {
		tx.clanMember.updateMany.mockResolvedValue({ count: 0 });
		expect(await donateIngredientsToClan('p1', 1, [{ ingredientId: 3, quantity: 2 }], 40)).toBe(false);
		expect(tx.clan.update).not.toHaveBeenCalled();
	});

	it('moves the ingredients and credits the treasure and the contribution', async () => {
		expect(await donateIngredientsToClan('p1', 1, [{ ingredientId: 3, quantity: 2 }], 40)).toBe(true);
		expect(tx.clanIngredient.upsert).toHaveBeenCalled();
		expect(tx.clan.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { treasureValue: { increment: 40 } } });
	});
});

describe('parseQuantityLines', () => {
	it('merges the lines of a same id', () => {
		expect(
			parseQuantityLines([
				{ itemId: 1, quantity: 2 },
				{ itemId: 1, quantity: 3 },
				{ itemId: 2, quantity: 1 }
			])
		).toEqual([
			{ itemId: 1, quantity: 5 },
			{ itemId: 2, quantity: 1 }
		]);
	});

	it.each([[undefined], ['x'], [[]], [[{ itemId: '1', quantity: 1 }]], [[{ itemId: 1, quantity: '1' }]], [[null]]])(
		'refuses %j',
		raw => {
			expect(() => parseQuantityLines(raw, 'bad')).toThrow('bad');
		}
	);
});
