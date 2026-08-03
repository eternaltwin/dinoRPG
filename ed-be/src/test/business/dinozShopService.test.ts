import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { makeRequest } from '../helpers/req.js';

// Strategy B: mock the DAO modules so the business logic runs without a database or a real
// authorization header. `auth` lives in playerDao, so mocking that module stubs both the
// auth check and the shop query in one place.
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getPlayerDinozShopRequest: vi.fn()
}));
vi.mock('../../dao/playerDinozShopDao.js', () => ({
	createMultipleDinoz: vi.fn()
}));
// The shop-fill branch leans on these random helpers; stub them so generated dinoz are deterministic.
vi.mock('../../utils/index.js', () => ({
	getRandomArrayElement: vi.fn(),
	getRandomLetter: vi.fn()
}));

import { auth, getPlayerDinozShopRequest } from '../../dao/playerDao.js';
import { createMultipleDinoz } from '../../dao/playerDinozShopDao.js';
import { getRandomArrayElement, getRandomLetter } from '../../utils/index.js';
import { getDinozFromDinozShop } from '../../business/dinozShopService.js';
import gameConfig from '../../config/game.config.js';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { Reward } from '@drpg/core/models/reward/RewardList';

const mockAuth = vi.mocked(auth);
const mockGetShop = vi.mocked(getPlayerDinozShopRequest);
const mockCreateMultiple = vi.mocked(createMultipleDinoz);
const mockRandomArray = vi.mocked(getRandomArrayElement);
const mockRandomLetter = vi.mocked(getRandomLetter);

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
			],
			rewards: []
		} as unknown as Awaited<ReturnType<typeof getPlayerDinozShopRequest>>);

		const result = await getDinozFromDinozShop(makeRequest());

		expect(result).toEqual([
			{ id: '1', race: 2, display: 'aaa' },
			{ id: '3', race: 5, display: 'ccc' }
		]);
		expect(mockAuth).toHaveBeenCalledOnce();
	});
});

describe('getDinozFromDinozShop - empty shop fills the shop', () => {
	const emptyShop = { id: 'player-1', dinozShop: [], rewards: [] } as unknown as Awaited<
		ReturnType<typeof getPlayerDinozShopRequest>
	>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockAuth.mockResolvedValue({ id: 'player-1' } as Awaited<ReturnType<typeof auth>>);
		mockGetShop.mockResolvedValue(emptyShop);
		// Deterministic generation: always pick the first available race and the letter 'a'.
		mockRandomArray.mockImplementation(arr => arr[0]);
		mockRandomLetter.mockReturnValue('a');
		mockCreateMultiple.mockResolvedValue([] as never);
	});

	it('generates gameConfig.shop.dinozNumber dinoz with a well-formed display', async () => {
		await getDinozFromDinozShop(makeRequest());

		expect(mockCreateMultiple).toHaveBeenCalledOnce();
		const created = mockCreateMultiple.mock.calls[0][0];
		expect(created).toHaveLength(gameConfig.shop.dinozNumber);

		// Race 0 of the base pool is Winks; display = swfLetter + 11 letters + '000' (16 chars).
		const winks = raceList[RaceEnum.WINKS];
		const expectedDisplay = winks.swfLetter + 'a'.repeat(11) + '000';
		for (const dinoz of created) {
			expect(dinoz.playerId).toBe('player-1');
			expect(dinoz.raceId).toBe(winks.raceId);
			expect(dinoz.display).toBe(expectedDisplay);
			expect(dinoz.display).toHaveLength(16);
		}
	});

	it('returns the created dinoz mapped and sorted by id', async () => {
		mockCreateMultiple.mockResolvedValue([
			{ id: 3, raceId: 5, display: 'ccc' },
			{ id: 1, raceId: 2, display: 'aaa' }
		] as never);

		const result = await getDinozFromDinozShop(makeRequest());

		expect(result).toEqual([
			{ id: '1', race: 2, display: 'aaa' },
			{ id: '3', race: 5, display: 'ccc' }
		]);
	});

	it('offers only the nine base races when the player owns no trophy', async () => {
		await getDinozFromDinozShop(makeRequest());
		const offered = mockRandomArray.mock.calls[0][0] as DinozRace[];
		expect(offered).toHaveLength(9);
		expect(offered).not.toContain(raceList[RaceEnum.ROCKY]);
	});

	it('adds Rocky, Hippoclamp and Pteroz when the matching trophies are owned', async () => {
		mockGetShop.mockResolvedValue({
			id: 'player-1',
			dinozShop: [],
			rewards: [{ rewardId: Reward.ROCKY }, { rewardId: Reward.HIPPO }, { rewardId: Reward.PTEROZ }]
		} as unknown as Awaited<ReturnType<typeof getPlayerDinozShopRequest>>);
		await getDinozFromDinozShop(makeRequest());
		const offered = mockRandomArray.mock.calls[0][0] as DinozRace[];
		expect(offered).toContain(raceList[RaceEnum.ROCKY]);
		expect(offered).toContain(raceList[RaceEnum.HIPPOCLAMP]);
		expect(offered).toContain(raceList[RaceEnum.PTEROZ]);
	});

	it('adds Quetzu only while the player is below the buyable Quetzu limit', async () => {
		mockGetShop.mockResolvedValue({
			id: 'player-1',
			dinozShop: [],
			rewards: [{ rewardId: Reward.QUETZU }],
			quetzuBought: 0
		} as unknown as Awaited<ReturnType<typeof getPlayerDinozShopRequest>>);
		await getDinozFromDinozShop(makeRequest());
		expect(mockRandomArray.mock.calls[0][0]).toContain(raceList[RaceEnum.QUETZU]);
	});

	it('does not add Quetzu once the buyable Quetzu limit is reached', async () => {
		mockGetShop.mockResolvedValue({
			id: 'player-1',
			dinozShop: [],
			rewards: [{ rewardId: Reward.QUETZU }],
			quetzuBought: gameConfig.shop.buyableQuetzu
		} as unknown as Awaited<ReturnType<typeof getPlayerDinozShopRequest>>);
		await getDinozFromDinozShop(makeRequest());
		expect(mockRandomArray.mock.calls[0][0]).not.toContain(raceList[RaceEnum.QUETZU]);
	});
});
