import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDinozFromDemonShop } from '../../business/demonShopService.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { Item } from '@drpg/core/models/item/ItemList';
import { UnavailableReason } from '@drpg/prisma';

import { auth } from '../../dao/playerDao.js';
import {
	createMultipleDemonDinoz,
	getDinozFromDemonShopRequest,
	getPlayerDemonShopRequest,
} from '../../dao/demonShopDao.js';
import { getRandomArrayElement } from '../../utils/index.js';
import { getDemonShopPrice } from '../../utils/dinoz.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { Skill } from '@drpg/core/models/dinoz/SkillList';

// ─── Module mocks ─────────────────────────────────────────────────────────────
// Only internal / infra modules are mocked. @drpg/core and @drpg/prisma are real.

vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	ownsDinoz: vi.fn(),
}));

vi.mock('../../dao/demonShopDao.js', () => ({
	getPlayerDemonShopRequest: vi.fn(),
	createMultipleDemonDinoz: vi.fn().mockResolvedValue(undefined),
	getDinozFromDemonShopRequest: vi.fn(),
	getDinozDataForSacrificeRequest: vi.fn(),
	getDinozDataForUnsacrificeRequest: vi.fn(),
	deleteDinozInDemonShopRequest: vi.fn(),
}));

vi.mock('../../config/game.config.js', () => ({
	default: { demonShop: { dinozNumber: 3 } },
}));

vi.mock('../../utils/index.js', () => ({
	applySkillToDinoz: vi.fn(),
	getRandomArrayElement: vi.fn(),
}));

vi.mock('../../utils/dinoz.js', () => ({
	isAtMaxActiveDinoz: vi.fn(),
	generateDinozDisplay: vi.fn().mockReturnValue('display-generated'),
	getRandomUpElement: vi.fn().mockReturnValue(1),
	randomlyLevelUpDinoz: vi.fn(),
    getDemonShopPrice: vi.fn()
}));

vi.mock('../../utils/server/translate.js', () => ({
	default: vi.fn((key: string) => key),
}));

vi.mock('../../context.js', () => ({
	GLOBAL: { config: { salt: 'test-salt', isProduction: false } },
	LOGGER: { error: vi.fn() },
}));

// If Vitest doesn't intercept this, try 'node:crypto' instead.
vi.mock('crypto', () => ({
	randomUUID: vi.fn().mockReturnValue('mock-uuid'),
}));

// ─── Constants derived from real @drpg/core data ──────────────────────────────

// A valid key guaranteed to be present in raceList (used for shop mapping)
const ANY_RACE_ID = Object.values(RaceEnum)[0] as RaceEnum;

// A race with .demon set (needed so availableRaces is non-empty during refill)
const DEMON_RACE_ID = (
	Object.values(RaceEnum).find((id) => Boolean(raceList[id as RaceEnum]?.demon)) ?? ANY_RACE_ID
) as RaceEnum;

const MOCK_DINOZ_NUMBER = 3; // mirrors the game.config mock
const WITHOUT_BELIUS_TOTAL = MOCK_DINOZ_NUMBER; // Math.round(3 × 1) = 3
const WITH_BELIUS_TOTAL = Math.round(MOCK_DINOZ_NUMBER * 1.5); // Math.round(4.5) = 5

// ─── Factories ────────────────────────────────────────────────────────────────

const mockRequest = {} as any;
const mockAuthed = { id: 42, lang: 'en' };

/** A minimal player dinoz (defaults to a valid cemetery dinoz). */
function makeDinoz(overrides: Record<string, any> = {}) {
	return {
		id: 1,
		level: 5,
		display: 'display-xyz',
		raceId: ANY_RACE_ID,
		placeId: PlaceEnum.CIMETIERE,
		unavailableReason: null,
		nbrUpFire: 1,
		nbrUpWood: 2,
		nbrUpWater: 3,
		nbrUpLightning: 4,
		nbrUpAir: 5,
		skills: [] as { skillId: Skill }[],
		...overrides,
	};
}

/** A minimal PlayerDemonShop row. */
function makeShopDinoz(overrides: Record<string, any> = {}) {
	return {
		id: 1,
		display: 'display-shop',
		raceId: RaceEnum.GORILLOZ_DEMON,
        seed: '123',
		nbrUpFire: 1,
		nbrUpWood: 2,
		nbrUpWater: 3,
		nbrUpLightning: 4,
		nbrUpAir: 5,
        nextUpElementId: ElementType.FIRE,
        nextUpAltElementId: ElementType.FIRE,
		skills: [] as { id: number, dinozId: number, skillId: Skill }[],
		unlockableSkills: [] as { id: number, dinozId: number, skillId: Skill }[],
		...overrides,
	};
}

/**
 * A minimal player with:
 *  - DEMON reward (required for shop access)
 *  - 30 demon tickets (required to see the shop list)
 *  - demonShop already at WITHOUT_BELIUS_TOTAL length (avoids triggering refill by default)
 */
function makePlayer(overrides: Record<string, any> = {}) {
	return {
		id: 'abc',
        quetzuBought: 0,
        engineer: false,
        quests: [],
        ranking: null,
		rewards: [{ id: 1, playerId: 'abc', rewardId: Reward.DEMON }],
		dinoz: [],
		items: [{ itemId: Item.DEMON_TICKET, quantity: 30 }],
		demonShop: Array.from({ length: WITHOUT_BELIUS_TOTAL }, (_, i) =>
			makeShopDinoz({ id: i + 1 }),
		),
		...overrides,
	};
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getDinozFromDemonShop', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue(mockAuthed);
	});

	// ── Input validation ────────────────────────────────────────────────────────

	describe('input validation', () => {
		it('throws ExpectedError when player is not found', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(null);

			await expect(getDinozFromDemonShop(mockRequest)).rejects.toBeInstanceOf(ExpectedError);
		});

		it('throws ExpectedError when player has no DEMON reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ rewards: [] }),
			);

			await expect(getDinozFromDemonShop(mockRequest)).rejects.toBeInstanceOf(ExpectedError);
		});
	});

	// ── result.dinoz — cemetery dinoz ───────────────────────────────────────────

	describe('result.dinoz (cemetery dinoz)', () => {
		it('includes dinoz at CIMETIERE with null unavailableReason', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ dinoz: [makeDinoz({ id: 1, unavailableReason: null })], items: [] }),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.dinoz).toHaveLength(1);
			expect(result.dinoz[0].id).toBe(1);
		});

		it('includes dinoz at CIMETIERE with resting unavailableReason', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [makeDinoz({ id: 2, unavailableReason: UnavailableReason.resting })],
					items: [],
				}),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.dinoz).toHaveLength(1);
			expect(result.dinoz[0].id).toBe(2);
		});

		it('excludes dinoz at CIMETIERE with sacrificed unavailableReason', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [makeDinoz({ unavailableReason: UnavailableReason.sacrificed })],
					items: [],
				}),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.dinoz).toHaveLength(0);
		});

		it('excludes dinoz that are not at CIMETIERE', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [makeDinoz({ placeId: PlaceEnum.DINOVILLE })],
					items: [],
				}),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.dinoz).toHaveLength(0);
		});

		it('sorts cemetery dinoz by id ascending', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ dinoz: [3, 1, 2].map((id) => makeDinoz({ id })), items: [] }),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.dinoz.map((d) => d.id)).toEqual([1, 2, 3]);
		});

		it('computes price via getDemonShopPrice using the dinoz level', async () => {
            const level = 7;
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ dinoz: [makeDinoz({ level })], items: [] }),
			);

			const result = await getDinozFromDemonShop(mockRequest);
			expect(result.dinoz[0].price).toBe(getDemonShopPrice(level));
		});

		it('extracts skill ids from dinoz.skills', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [makeDinoz({ skills: [{ skillId: '10' }, { skillId: '20' }] })],
					items: [],
				}),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.dinoz[0].skills).toEqual(['10', '20']);
		});
	});

	// ── result.sacrificed — sacrificed dinoz ────────────────────────────────────

	describe('result.sacrificed (sacrificed dinoz)', () => {
		it('includes only dinoz with sacrificed unavailableReason', async () => {
			const dinozList = [
				makeDinoz({ id: 1, unavailableReason: UnavailableReason.sacrificed }),
				makeDinoz({ id: 2, unavailableReason: null }),
				makeDinoz({ id: 3, unavailableReason: UnavailableReason.resting }),
			];
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ dinoz: dinozList, items: [] }),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.sacrificed).toHaveLength(1);
			expect(result.sacrificed[0].id).toBe(1);
		});

		it('sorts sacrificed dinoz by id ascending', async () => {
			const dinozList = [30, 10, 20].map((id) =>
				makeDinoz({ id, unavailableReason: UnavailableReason.sacrificed }),
			);
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ dinoz: dinozList, items: [] }),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.sacrificed.map((d) => d.id)).toEqual([10, 20, 30]);
		});

		it('sorts skills within each sacrificed dinoz numerically ascending', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [
						makeDinoz({
							unavailableReason: UnavailableReason.sacrificed,
							skills: [{ skillId: '30' }, { skillId: '10' }, { skillId: '20' }],
						}),
					],
					items: [],
				}),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.sacrificed[0].skills).toEqual(['10', '20', '30']);
		});

		it('computes price via getDemonShopPrice using the dinoz level', async () => {
			const level = 8;
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [makeDinoz({ level, unavailableReason: UnavailableReason.sacrificed })],
					items: [],
				}),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.sacrificed[0].price).toBe(getDemonShopPrice(level));
		});
	});

	// ── result.shop — ticket threshold ──────────────────────────────────────────

	describe('result.shop — ticket threshold', () => {
		it('returns empty shop when player has fewer than 30 demon tickets', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ items: [{ itemId: Item.DEMON_TICKET, quantity: 29 }] }),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.shop).toEqual([]);
		});

		it('returns empty shop when player has no demon ticket item at all', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ items: [] }));

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.shop).toEqual([]);
		});

		it('populates shop when player has exactly 30 demon tickets', async () => {
			// makePlayer() defaults to 30 tickets + a pre-filled demonShop
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.shop.length).toBeGreaterThan(0);
		});
	});

	// ── result.shop — already filled ────────────────────────────────────────────

	describe('result.shop — already filled (demonShop.length === totalDinoz)', () => {
		it('does not call createMultipleDemonDinoz', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

			await getDinozFromDemonShop(mockRequest);

			expect(createMultipleDemonDinoz).not.toHaveBeenCalled();
		});

		it('returns the correct number of shop dinoz', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.shop).toHaveLength(WITHOUT_BELIUS_TOTAL);
		});

		it('sets level=10 on every demon dinoz', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

			const result = await getDinozFromDemonShop(mockRequest);

			for (const d of result.shop) {
				expect(d.level).toBe(10);
			}
		});

		it('sorts existing shop dinoz by id ascending', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ demonShop: [3, 1, 2].map((id) => makeShopDinoz({ id })) }),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.shop.map((d) => d.id)).toEqual([1, 2, 3]);
		});

		it('uses 1.5× totalDinoz when player has BELIUS reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					rewards: [{ rewardId: Reward.DEMON }, { rewardId: Reward.BELIUS }],
					demonShop: Array.from({ length: WITH_BELIUS_TOTAL }, (_, i) =>
						makeShopDinoz({ id: i + 1 }),
					),
				}),
			);

			const result = await getDinozFromDemonShop(mockRequest);

			expect(createMultipleDemonDinoz).not.toHaveBeenCalled();
			expect(result.shop).toHaveLength(WITH_BELIUS_TOTAL);
		});
	});

	// ── result.shop — refill ────────────────────────────────────────────────────

	describe('result.shop — refill (demonShop.length !== totalDinoz)', () => {
		beforeEach(() => {
			// Return a real demon race from the race picker
			vi.mocked(getRandomArrayElement).mockReturnValue(raceList[DEMON_RACE_ID]);

			// Simulate the DB rows returned after creation
			vi.mocked(getDinozFromDemonShopRequest).mockResolvedValue([
				makeShopDinoz({ id: 99, raceId: DEMON_RACE_ID }),
			]);
		});

		/**
		 * Refill requires at least one cemetery dinoz so the service can call
		 * checkCondition(…, dinozAtCemetary[0].id) without crashing.
		 */
		function makeRefillPlayer(overrides: Record<string, any> = {}) {
			return makePlayer({
				dinoz: [makeDinoz({ id: 1 })],
				demonShop: [], // length (0) !== totalDinoz (3) → triggers refill
				...overrides,
			});
		}

		it('calls createMultipleDemonDinoz when the shop is empty', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			await getDinozFromDemonShop(mockRequest);

			expect(createMultipleDemonDinoz).toHaveBeenCalledOnce();
		});

		it('creates dinozNumber (3) entries when player has no BELIUS reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			await getDinozFromDemonShop(mockRequest);

			const [createArgs] = vi.mocked(createMultipleDemonDinoz).mock.calls[0];
			expect(createArgs).toHaveLength(WITHOUT_BELIUS_TOTAL);
		});

		it('creates 1.5× dinozNumber (5) entries when player has BELIUS reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makeRefillPlayer({
					rewards: [{ rewardId: Reward.DEMON }, { rewardId: Reward.BELIUS }],
				}),
			);

			await getDinozFromDemonShop(mockRequest);

			const [createArgs] = vi.mocked(createMultipleDemonDinoz).mock.calls[0];
			expect(createArgs).toHaveLength(WITH_BELIUS_TOTAL);
		});

		it('calls getDinozFromDemonShopRequest with the current player id after creation', async () => {
			const player = makeRefillPlayer();
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(player);

			await getDinozFromDemonShop(mockRequest);

			expect(getDinozFromDemonShopRequest).toHaveBeenCalledWith(player.id);
		});

		it('returns shop mapped from getDinozFromDemonShopRequest', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.shop).toHaveLength(1);
			expect(result.shop[0].id).toBe(99);
		});

		it('returns newly created shop dinoz with level=10', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			const result = await getDinozFromDemonShop(mockRequest);

			expect(result.shop[0].level).toBe(10);
		});
	});

	// ── Return shape ────────────────────────────────────────────────────────────

	it('always returns an object with dinoz, sacrificed, and shop arrays', async () => {
		vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ items: [] }));

		const result = await getDinozFromDemonShop(mockRequest);

		expect(result).toMatchObject({
			dinoz: expect.any(Array),
			sacrificed: expect.any(Array),
			shop: expect.any(Array),
		});
	});
});