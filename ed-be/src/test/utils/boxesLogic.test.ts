import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Item, itemList } from '@drpg/core/models/item/ItemList';

// Stub the random roll so box selection/opening is deterministic, the DAO so completion runs
// without a database, and the game config so the completion ratios are pinned to known maxima.
vi.mock('../../utils/fight/weightedRandom.js', () => ({ default: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ getBoxHandlerInformations: vi.fn() }));
vi.mock('../../config/game.config.js', () => ({ default: { dinoz: { maxQuantity: 18, maxLevel: 50 } } }));

import weightedRandom from '../../utils/fight/weightedRandom.js';
import { getBoxHandlerInformations } from '../../dao/playerDao.js';
import { selectBox, boxOpening, calculatePlayerCompletion } from '../../utils/boxesLogic.js';

const mockWeightedRandom = vi.mocked(weightedRandom);
const mockGetBoxInfo = vi.mocked(getBoxHandlerInformations);

beforeEach(() => {
	vi.clearAllMocks();
});

describe('selectBox', () => {
	it('returns the box for the rolled tier', () => {
		mockWeightedRandom.mockReturnValue({ tier: 3, type: Item.BOX_EPIC, odds: 24 } as never);
		expect(selectBox(0)).toBe(itemList[Item.BOX_EPIC]);
	});

	it('rolls once per ten completion (plus one) and keeps the highest tier', () => {
		mockWeightedRandom
			.mockReturnValueOnce({ tier: 1, type: Item.BOX_COMMON, odds: 900 } as never)
			.mockReturnValueOnce({ tier: 4, type: Item.BOX_LEGENDARY, odds: 1 } as never)
			.mockReturnValue({ tier: 1, type: Item.BOX_COMMON, odds: 900 } as never);

		const result = selectBox(20); // floor(20 / 10) + 1 === 3 rolls

		expect(mockWeightedRandom).toHaveBeenCalledTimes(3);
		expect(result).toBe(itemList[Item.BOX_LEGENDARY]);
	});
});

describe('boxOpening', () => {
	it('returns the rolled item and quantity for a valid box', () => {
		mockWeightedRandom.mockReturnValue({ item: itemList[Item.GOBLIN_MERGUEZ], quantity: 2 } as never);
		const result = boxOpening(itemList[Item.BOX_COMMON]);
		expect(result).toEqual({ item: itemList[Item.GOBLIN_MERGUEZ], quantity: 2 });
	});

	it('throws when the item is not an openable box', () => {
		expect(() => boxOpening(itemList[Item.GOBLIN_MERGUEZ])).toThrow(ExpectedError);
	});
});

describe('calculatePlayerCompletion', () => {
	it('throws when the player does not exist', async () => {
		mockGetBoxInfo.mockResolvedValue(null);
		await expect(calculatePlayerCompletion('player-1')).rejects.toThrow(ExpectedError);
	});

	it('returns 0 when the player has no dinoz', async () => {
		mockGetBoxInfo.mockResolvedValue({
			_count: { dinoz: 0 },
			dinoz: [],
			rewards: [],
			cooker: false,
			engineer: false,
			matelasseur: false,
			merchant: false,
			messie: false,
			leader: false,
			priest: false,
			shopKeeper: false,
			teacher: false
		} as unknown as Awaited<ReturnType<typeof getBoxHandlerInformations>>);

		expect(await calculatePlayerCompletion('player-1')).toBe(0);
	});

	it('returns 100 for a fully completed player', async () => {
		mockGetBoxInfo.mockResolvedValue({
			_count: { dinoz: 18 },
			dinoz: Array.from({ length: 18 }, () => ({ level: 50, _count: { missions: 55 } })),
			rewards: Array.from({ length: 23 }, (_, i) => ({ rewardId: i + 1 })),
			cooker: true,
			engineer: true,
			matelasseur: true,
			merchant: true,
			messie: true,
			leader: true,
			priest: true,
			shopKeeper: true,
			teacher: true
		} as unknown as Awaited<ReturnType<typeof getBoxHandlerInformations>>);

		expect(await calculatePlayerCompletion('player-1')).toBeCloseTo(100);
	});
});
