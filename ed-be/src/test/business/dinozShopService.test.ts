import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { makeRequest } from '../helpers/req.js';

// Strategy B: mock the DAO modules so the business logic runs without a database or a real
// authorization header. `auth` lives in playerDao, so mocking that module stubs both the
// auth check and the shop query in one place.
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getPlayerDinozShopRequest: vi.fn(),
	getPlayerRewardsRequest: vi.fn()
}));
vi.mock('../../dao/playerDinozShopDao.js', () => ({
	createMultipleDinoz: vi.fn()
}));

import { auth, getPlayerDinozShopRequest } from '../../dao/playerDao.js';
import { getDinozFromDinozShop } from '../../business/dinozShopService.js';

const mockAuth = vi.mocked(auth);
const mockGetShop = vi.mocked(getPlayerDinozShopRequest);

describe('getDinozFromDinozShop', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Canned authenticated player; only `id` is read by the handler.
		mockAuth.mockResolvedValue({ id: 'player-1' } as Awaited<ReturnType<typeof auth>>);
	});

	it('throws ExpectedError when the player does not exist', async () => {
		mockGetShop.mockResolvedValue(null);
		await expect(getDinozFromDinozShop(makeRequest())).rejects.toThrow(ExpectedError);
	});

	it('returns the existing shop dinoz sorted by id', async () => {
		mockGetShop.mockResolvedValue({
			id: 'player-1',
			dinozShop: [
				{ id: 3, raceId: 5, display: 'ccc' },
				{ id: 1, raceId: 2, display: 'aaa' }
			]
		} as unknown as Awaited<ReturnType<typeof getPlayerDinozShopRequest>>);

		const result = await getDinozFromDinozShop(makeRequest());

		expect(result).toEqual([
			{ id: '1', race: 2, display: 'aaa' },
			{ id: '3', race: 5, display: 'ccc' }
		]);
		expect(mockAuth).toHaveBeenCalledOnce();
	});
});
