import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	buyDemonDinoz,
	getDinozFromDemonShop,
	sacrificeDinoz,
	unsacrificeDinoz
} from '../../business/demonShopService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { LogType, UnavailableReason } from '@drpg/prisma';

import { auth } from '../../dao/playerDao.js';
import {
	createMultipleDemonDinoz,
	deleteDinozInDemonShopRequest,
	getDinozDataForSacrificeRequest,
	getDinozDataForUnsacrificeRequest,
	getDinozFromDemonShopRequest,
	getPlayerDemonShopRequest
} from '../../dao/demonShopDao.js';
import { getRandomArrayElement } from '../../utils/index.js';
import { getDemonShopPrice, hasAnyActiveDinozAt, isAtMaxActiveDinoz } from '../../utils/dinoz.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { makeRequest } from '../helpers/req.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../../dao/playerItemDao.js';
import { updateDinozCount, updatePoints } from '../../dao/rankingDao.js';
import { createDinoz, getDinozFicheRequest, updateDinoz } from '../../dao/dinozDao.js';
import { computeUSkillsForPlayer } from '../../business/skillService.js';
import { createLog } from '../../dao/logDao.js';

// ─── Module mocks ─────────────────────────────────────────────────────────────
// Only internal / infra modules are mocked. @drpg/core and @drpg/prisma are real.

vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn()
}));

vi.mock('../../dao/dinozDao.js', () => ({
	createDinoz: vi.fn(),
	getDinozFicheRequest: vi.fn(),
	updateDinoz: vi.fn()
}));

vi.mock('../../dao/demonShopDao.js', () => ({
	getPlayerDemonShopRequest: vi.fn(),
	createMultipleDemonDinoz: vi.fn().mockResolvedValue(undefined),
	getDinozFromDemonShopRequest: vi.fn(),
	getDinozDataForSacrificeRequest: vi.fn(),
	getDinozDataForUnsacrificeRequest: vi.fn(),
	deleteDinozInDemonShopRequest: vi.fn()
}));

vi.mock('../../dao/playerItemDao.js', () => ({
	decreaseItemQuantity: vi.fn(),
	increaseItemQuantity: vi.fn(),
	insertItem: vi.fn()
}));

vi.mock('../../dao/rankingDao.js', () => ({
	updatePoints: vi.fn(),
	updateDinozCount: vi.fn()
}));

vi.mock('../../dao/logDao.js', () => ({
	createLog: vi.fn()
}));

vi.mock('../../business/skillService.js', () => ({ computeUSkillsForPlayer: vi.fn() }));

vi.mock('../../config/game.config.js', () => ({
	default: { demonShop: { dinozNumber: 3 } }
}));

vi.mock('../../utils/index.js', () => ({
	applySkillToDinoz: vi.fn(),
	getRandomArrayElement: vi.fn()
}));

vi.mock('../../utils/dinoz.js', async importOriginal => {
	const actual = await importOriginal();
	return {
		...actual,
		isAtMaxActiveDinoz: vi.fn(),
		generateDinozDisplay: vi.fn().mockReturnValue('display-generated'),
		getRandomUpElement: vi.fn().mockReturnValue(1),
		randomlyLevelUpDinoz: vi.fn(),
		hasAnyActiveDinozAt: vi.fn()
	};
});

vi.mock('../../utils/server/translate.js', () => ({
	default: vi.fn((key: string) => key)
}));

vi.mock('../../context.js', () => ({
	GLOBAL: { config: { salt: 'test-salt', isProduction: false } },
	LOGGER: { error: vi.fn() }
}));

// If Vitest doesn't intercept this, try 'node:crypto' instead.
vi.mock('crypto', () => ({
	randomUUID: vi.fn().mockReturnValue('mock-uuid')
}));

// ─── Constants derived from real @drpg/core data ──────────────────────────────

// A valid key guaranteed to be present in raceList (used for shop mapping)
const ANY_RACE_ID = Object.values(RaceEnum)[0] as RaceEnum;

// A race with .demon set (needed so availableRaces is non-empty during refill)
const DEMON_RACE_ID = (Object.values(RaceEnum).find(id => Boolean(raceList[id as RaceEnum]?.demon)) ??
	ANY_RACE_ID) as RaceEnum;

const MOCK_DINOZ_NUMBER = 3; // mirrors the game.config mock
const WITHOUT_BELIUS_TOTAL = MOCK_DINOZ_NUMBER; // Math.round(3 × 1) = 3
const WITH_BELIUS_TOTAL = Math.round(MOCK_DINOZ_NUMBER * 1.5); // Math.round(4.5) = 5

const DEFAULT_PLAYER_ID = 'abc';
const DEFAULT_DINOZ_ID = 1;

// ─── Factories ────────────────────────────────────────────────────────────────

const mockAuthed: any = { id: DEFAULT_PLAYER_ID, lang: 'en' };

/** A minimal player dinoz (defaults to a valid cemetery dinoz). */
function makeDinoz(overrides: Record<string, any> = {}): any {
	return {
		id: DEFAULT_DINOZ_ID,
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
		...overrides
	};
}

/** A minimal dinoz fiche. */
function makeDinozWPlayer(overrides: Record<string, any> = {}, playerOverrides: Record<string, any> = {}): any {
	return {
		id: DEFAULT_DINOZ_ID,
		level: 10,
		experience: 0,
		raceId: RaceEnum.GORILLOZ_DEMON,
		leaderId: null,
		fight: true,
		gather: true,
		remaining: 3,
		maxLife: 100,
		unavailableReason: null,
		placeId: PlaceEnum.CIMETIERE,
		life: 100,
		missions: [],
		concentration: null,
		followers: [],
		status: [],
		skills: [],
		TournamentTeam: [],
		items: [],
		player: {
			id: DEFAULT_PLAYER_ID,
			ranking: null,
			rewards: [{ id: 1, playerId: DEFAULT_PLAYER_ID, rewardId: Reward.DEMON }],
			items: [{ itemId: Item.DEMON_TICKET, quantity: 3000 }],
			...playerOverrides
		},
		...overrides
	};
}

/** A minimal PlayerDemonShop row. */
function makeShopDinoz(overrides: Record<string, any> = {}): any {
	return {
		id: DEFAULT_DINOZ_ID,
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
		skills: [] as { id: number; dinozId: number; skillId: Skill }[],
		unlockableSkills: [] as { id: number; dinozId: number; skillId: Skill }[],
		...overrides
	};
}

/**
 * A minimal player with:
 *  - DEMON reward (required for shop access)
 *  - 30 demon tickets (required to see the shop list)
 *  - demonShop already at WITHOUT_BELIUS_TOTAL length (avoids triggering refill by default)
 */
function makePlayer({ extraDinoz = [], ...overrides }: Record<string, any> = {}): any {
	return {
		id: 'abc',
		quetzuBought: 0,
		engineer: false,
		quests: [],
		ranking: null,
		rewards: [{ id: 1, playerId: 'abc', rewardId: Reward.DEMON }],
		dinoz: [makeDinoz(), ...extraDinoz],
		items: [{ itemId: Item.DEMON_TICKET, quantity: 3000 }],
		demonShop: Array.from({ length: WITHOUT_BELIUS_TOTAL }, (_, i) => makeShopDinoz({ id: i + 1 })),
		...overrides
	};
}

const req = (params = {}, body = {}) => makeRequest({ params, body });

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

			await expect(getDinozFromDemonShop(req())).rejects.toThrow('playerNotFound');
		});

		it('throws ExpectedError when player has no DEMON reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ rewards: [] }));

			await expect(getDinozFromDemonShop(req())).rejects.toThrow('error.noShopAccess');
		});

		it('throws ExpectedError when player has no dinoz at the cemetery', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ dinoz: [] }));

			await expect(getDinozFromDemonShop(req())).rejects.toThrow('noDinozAtCemetary');
		});
	});

	// ── result.dinoz — cemetery dinoz ───────────────────────────────────────────

	describe('result.dinoz (cemetery dinoz)', () => {
		it('includes dinoz at CIMETIERE with null unavailableReason', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ dinoz: [makeDinoz({ id: 1, unavailableReason: null })] })
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.dinoz).toHaveLength(1);
			expect(result.dinoz[0].id).toBe(1);
		});

		it('includes dinoz at CIMETIERE with resting unavailableReason', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [makeDinoz({ id: 2, unavailableReason: UnavailableReason.resting })]
				})
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.dinoz).toHaveLength(1);
			expect(result.dinoz[0].id).toBe(2);
		});

		it('excludes dinoz at CIMETIERE with sacrificed unavailableReason', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					extraDinoz: [makeDinoz({ unavailableReason: UnavailableReason.sacrificed })]
				})
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.dinoz).toHaveLength(1);
		});

		it('excludes dinoz that are not at CIMETIERE', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					extraDinoz: [makeDinoz({ placeId: PlaceEnum.DINOVILLE })]
				})
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.dinoz).toHaveLength(1);
		});

		it('sorts cemetery dinoz by id ascending', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ dinoz: [3, 1, 2].map(id => makeDinoz({ id })) })
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.dinoz.map(d => d.id)).toEqual([1, 2, 3]);
		});

		it('computes price via getDemonShopPrice using the dinoz level', async () => {
			const level = 7;
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ dinoz: [makeDinoz({ level })] }));

			const result = await getDinozFromDemonShop(req());
			expect(result.dinoz[0].price).toBe(getDemonShopPrice(level));
		});

		it('extracts skill ids from dinoz.skills', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					dinoz: [makeDinoz({ skills: [{ skillId: '10' }, { skillId: '20' }] })]
				})
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.dinoz[0].skills).toEqual(['10', '20']);
		});
	});

	// ── result.sacrificed — sacrificed dinoz ────────────────────────────────────

	describe('result.sacrificed (sacrificed dinoz)', () => {
		it('includes only dinoz with sacrificed unavailableReason', async () => {
			const dinozList = [
				makeDinoz({ id: 1, unavailableReason: UnavailableReason.sacrificed }),
				makeDinoz({ id: 2, unavailableReason: null }),
				makeDinoz({ id: 3, unavailableReason: UnavailableReason.resting })
			];
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ dinoz: dinozList }));

			const result = await getDinozFromDemonShop(req());

			expect(result.sacrificed).toHaveLength(1);
			expect(result.sacrificed[0].id).toBe(1);
		});

		it('sorts sacrificed dinoz by id ascending', async () => {
			const dinozList = [30, 10, 20].map(id => makeDinoz({ id, unavailableReason: UnavailableReason.sacrificed }));
			dinozList.push(makeDinoz());
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ dinoz: dinozList }));

			const result = await getDinozFromDemonShop(req());

			expect(result.sacrificed.map(d => d.id)).toEqual([10, 20, 30]);
		});

		it('sorts skills within each sacrificed dinoz numerically ascending', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					extraDinoz: [
						makeDinoz({
							unavailableReason: UnavailableReason.sacrificed,
							skills: [{ skillId: '30' }, { skillId: '10' }, { skillId: '20' }]
						})
					],
					items: []
				})
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.sacrificed[0].skills).toEqual(['10', '20', '30']);
		});

		it('computes price via getDemonShopPrice using the dinoz level', async () => {
			const level = 8;
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					extraDinoz: [makeDinoz({ level, unavailableReason: UnavailableReason.sacrificed })],
					items: []
				})
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.sacrificed[0].price).toBe(getDemonShopPrice(level));
		});
	});

	// ── result.shop — ticket threshold ──────────────────────────────────────────

	describe('result.shop — ticket threshold', () => {
		it('returns empty shop when player has fewer than 30 demon tickets', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ items: [{ itemId: Item.DEMON_TICKET, quantity: 29 }] })
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.shop).toEqual([]);
		});

		it('returns empty shop when player has no demon ticket item at all', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ items: [] }));

			const result = await getDinozFromDemonShop(req());

			expect(result.shop).toEqual([]);
		});

		it('populates shop when player has exactly 30 demon tickets', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ items: [{ itemId: Item.DEMON_TICKET, quantity: 3000 }] })
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.shop.length).toBeGreaterThan(0);
		});
	});

	// ── result.shop — already filled ────────────────────────────────────────────

	describe('result.shop — already filled (demonShop.length === totalDinoz)', () => {
		it('does not call createMultipleDemonDinoz', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

			await getDinozFromDemonShop(req());

			expect(createMultipleDemonDinoz).not.toHaveBeenCalled();
		});

		it('returns the correct number of shop dinoz', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

			const result = await getDinozFromDemonShop(req());

			expect(result.shop).toHaveLength(WITHOUT_BELIUS_TOTAL);
		});

		it('sets level=10 on every demon dinoz', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

			const result = await getDinozFromDemonShop(req());

			for (const d of result.shop) {
				expect(d.level).toBe(10);
			}
		});

		it('sorts existing shop dinoz by id ascending', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ demonShop: [3, 1, 2].map(id => makeShopDinoz({ id })) })
			);

			const result = await getDinozFromDemonShop(req());

			expect(result.shop.map(d => d.id)).toEqual([1, 2, 3]);
		});

		it('uses 1.5× totalDinoz when player has BELIUS reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({
					rewards: [{ rewardId: Reward.DEMON }, { rewardId: Reward.BELIUS }],
					demonShop: Array.from({ length: WITH_BELIUS_TOTAL }, (_, i) => makeShopDinoz({ id: i + 1 }))
				})
			);

			const result = await getDinozFromDemonShop(req());

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
			vi.mocked(getDinozFromDemonShopRequest).mockResolvedValue([makeShopDinoz({ id: 99, raceId: DEMON_RACE_ID })]);
		});

		/**
		 * Refill requires at least one cemetery dinoz so the service can call
		 * checkCondition(…, dinozAtCemetary[0].id) without crashing.
		 */
		function makeRefillPlayer(overrides: Record<string, any> = {}) {
			return makePlayer({
				dinoz: [makeDinoz({ id: 1 })],
				demonShop: [], // length (0) !== totalDinoz (3) → triggers refill
				...overrides
			});
		}

		it('calls createMultipleDemonDinoz when the shop is empty', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			await getDinozFromDemonShop(req());

			expect(createMultipleDemonDinoz).toHaveBeenCalledOnce();
		});

		it('creates dinozNumber (3) entries when player has no BELIUS reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			await getDinozFromDemonShop(req());

			const [createArgs] = vi.mocked(createMultipleDemonDinoz).mock.calls[0];
			expect(createArgs).toHaveLength(WITHOUT_BELIUS_TOTAL);
		});

		it('creates 1.5× dinozNumber (5) entries when player has BELIUS reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makeRefillPlayer({
					rewards: [{ rewardId: Reward.DEMON }, { rewardId: Reward.BELIUS }]
				})
			);

			await getDinozFromDemonShop(req());

			const [createArgs] = vi.mocked(createMultipleDemonDinoz).mock.calls[0];
			expect(createArgs).toHaveLength(WITH_BELIUS_TOTAL);
		});

		it('calls getDinozFromDemonShopRequest with the current player id after creation', async () => {
			const player = makeRefillPlayer();
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(player);

			await getDinozFromDemonShop(req());

			expect(getDinozFromDemonShopRequest).toHaveBeenCalledWith(player.id);
		});

		it('returns shop mapped from getDinozFromDemonShopRequest', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			const result = await getDinozFromDemonShop(req());

			expect(result.shop).toHaveLength(1);
			expect(result.shop[0].id).toBe(99);
		});

		it('returns newly created shop dinoz with level=10', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makeRefillPlayer());

			const result = await getDinozFromDemonShop(req());

			expect(result.shop[0].level).toBe(10);
		});
	});

	// ── Return shape ────────────────────────────────────────────────────────────

	it('always returns an object with dinoz, sacrificed, and shop arrays', async () => {
		vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());

		const result = await getDinozFromDemonShop(req());

		expect(result).toMatchObject({
			dinoz: expect.any(Array),
			sacrificed: expect.any(Array),
			shop: expect.any(Array)
		});
	});
});

describe('buyDemonDinoz', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue(mockAuthed);
	});

	// ── Input validation ────────────────────────────────────────────────────────

	describe('input validation', () => {
		it('throws ExpectedError when player is not found', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(null);

			await expect(buyDemonDinoz(req())).rejects.toThrow('playerNotFound');
		});

		it('throws ExpectedError when player has no DEMON reward', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ rewards: [] }));

			await expect(buyDemonDinoz(req())).rejects.toThrow('error.noShopAccess');
		});

		it('throws ExpectedError when player has no dinoz at the cemetery', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ dinoz: [] }));

			await expect(buyDemonDinoz(req())).rejects.toThrow('noDinozAtCemetary');
		});

		it('throws ExpectedError when player has reached max active dinoz', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());
			vi.mocked(isAtMaxActiveDinoz).mockResolvedValueOnce(true);

			await expect(buyDemonDinoz(req())).rejects.toThrow('tooManyActiveDinoz');
		});

		it('throws ExpectedError when dinoz does not exist in player demon shop', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer({ demonShop: [] }));

			await expect(buyDemonDinoz(req())).rejects.toThrow('dinozNotFound');
		});

		it('throws ExpectedError when player does not have enough tickets', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(
				makePlayer({ items: [{ itemId: Item.DEMON_TICKET, quantity: 123 }] })
			);

			await expect(buyDemonDinoz(req({ id: '1' }))).rejects.toThrow('error.notEnoughTickets');
		});
	});

	// ── Processing validation ────────────────────────────────────────────────────────

	describe('processing validation', () => {
		it('normal flow', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());
			vi.mocked(createDinoz).mockResolvedValue(makeShopDinoz());
			vi.mocked(getDinozFicheRequest).mockResolvedValue({ dinoz: [makeDinozWPlayer()] } as never);

			const result = await buyDemonDinoz(req({ id: '1' }));

			expect(result).toBeDefined();
			expect(decreaseItemQuantity).toHaveBeenCalledOnce();
			expect(updatePoints).toHaveBeenCalledOnce();
			expect(updateDinozCount).toHaveBeenCalledOnce();
			expect(deleteDinozInDemonShopRequest).toHaveBeenCalledOnce();
			expect(createDinoz).toHaveBeenCalledOnce();
			expect(getDinozFicheRequest).toHaveBeenCalledOnce();
		});

		it('dinoz disappear after creation', async () => {
			vi.mocked(getPlayerDemonShopRequest).mockResolvedValue(makePlayer());
			vi.mocked(createDinoz).mockResolvedValue(makeShopDinoz());
			vi.mocked(getDinozFicheRequest).mockResolvedValue(null);

			await expect(buyDemonDinoz(req({ id: '1' }))).rejects.toThrow('playerNotFound');
		});
	});
});

describe('sacrificeDinoz', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue(mockAuthed);
	});

	// ── Input validation ────────────────────────────────────────────────────────

	describe('input validation', () => {
		it('throws ExpectedError when player has dinoz does not exist', async () => {
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(null);
			await expect(sacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('dinozNotFound');
		});

		it('throws ExpectedError when dinoz belongs to another player', async () => {
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(makeDinozWPlayer({}, { id: 'other' }));
			await expect(sacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.notYourDinoz');
		});

		it('throws ExpectedError when dinoz is not at the cemetary', async () => {
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(makeDinozWPlayer({ placeId: PlaceEnum.DINOVILLE }));
			await expect(sacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.dinozWrongLocation');
		});

		it('throws ExpectedError when player does not have the reward', async () => {
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(makeDinozWPlayer({}, { rewards: [] }));
			await expect(sacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.noShopAccess');
		});

		it('throws ExpectedError when Dinoz is unavailable', async () => {
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(
				makeDinozWPlayer({ unavailableReason: UnavailableReason.sacrificed })
			);
			await expect(sacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.dinozNotAvailable');
		});

		it('throws ExpectedError when Dinoz has still items equipped', async () => {
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(makeDinozWPlayer({ items: [Item.FIGHT_RATION] }));
			await expect(sacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.dinozInventoryNotEmpty');
		});

		it('throws ExpectedError if player has max number of demon tickets', async () => {
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(
				makeDinozWPlayer(
					{},
					{ items: [{ itemId: Item.DEMON_TICKET, quantity: itemList[Item.DEMON_TICKET].maxQuantity }] }
				)
			);
			await expect(sacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.tooManyItems');
		});
	});

	// ── Processing validation ────────────────────────────────────────────────────────

	describe('processing validation', () => {
		it('normal flow', async () => {
			const LEVEL = 10;
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(makeDinozWPlayer({ level: LEVEL }));
			const result = await sacrificeDinoz(req({ dinozId: '1' }));

			expect(result).toBeDefined();

			expect(updateDinoz).toHaveBeenCalledWith(1, { unavailableReason: UnavailableReason.sacrificed });
			expect(increaseItemQuantity).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, Item.DEMON_TICKET, getDemonShopPrice(LEVEL));
			expect(updatePoints).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, -LEVEL);
			expect(updateDinozCount).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, -1);
			expect(computeUSkillsForPlayer).toHaveBeenCalledOnce();
			expect(createLog).toHaveBeenCalledWith(
				LogType.Sacrifice,
				DEFAULT_PLAYER_ID,
				DEFAULT_DINOZ_ID,
				getDemonShopPrice(LEVEL)
			);
		});

		it('normal flow - no demon tickets prior', async () => {
			const LEVEL = 10;
			vi.mocked(getDinozDataForSacrificeRequest).mockResolvedValue(makeDinozWPlayer({ level: LEVEL }, { items: [] }));
			const result = await sacrificeDinoz(req({ dinozId: '1' }));

			expect(result).toBeDefined();

			expect(updateDinoz).toHaveBeenCalledWith(1, { unavailableReason: UnavailableReason.sacrificed });
			expect(insertItem).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, {
				itemId: Item.DEMON_TICKET,
				quantity: getDemonShopPrice(LEVEL)
			});
			expect(updatePoints).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, -LEVEL);
			expect(updateDinozCount).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, -1);
			expect(computeUSkillsForPlayer).toHaveBeenCalledOnce();
			expect(createLog).toHaveBeenCalledWith(
				LogType.Sacrifice,
				DEFAULT_PLAYER_ID,
				DEFAULT_DINOZ_ID,
				getDemonShopPrice(LEVEL)
			);
		});
	});
});

describe('unsacrificeDinoz', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue(mockAuthed);
		vi.mocked(hasAnyActiveDinozAt).mockResolvedValue(true);
		vi.mocked(isAtMaxActiveDinoz).mockResolvedValue(false);
	});

	// ── Input validation ────────────────────────────────────────────────────────

	describe('input validation', () => {
		it('throws ExpectedError when player does not have a Dinoz at the cemetary', async () => {
			vi.mocked(hasAnyActiveDinozAt).mockResolvedValue(false);
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.noDinozAtCemetary');
		});

		it('throws ExpectedError when player has max active Dinoz', async () => {
			vi.mocked(isAtMaxActiveDinoz).mockResolvedValue(true);
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('tooManyActiveDinoz');
		});

		it('throws ExpectedError when no dinoz found', async () => {
			vi.mocked(getDinozDataForUnsacrificeRequest).mockResolvedValue(null);
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('dinozNotFound');
		});

		it('throws ExpectedError when dinoz belongs to another player', async () => {
			vi.mocked(getDinozDataForUnsacrificeRequest).mockResolvedValue(makeDinozWPlayer({}, { id: 'other' }));
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.notYourDinoz');
		});

		it('throws ExpectedError when player does not have the reward', async () => {
			vi.mocked(getDinozDataForUnsacrificeRequest).mockResolvedValue(makeDinozWPlayer({}, { rewards: [] }));
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.noShopAccess');
		});

		it('throws ExpectedError when Dinoz is available', async () => {
			vi.mocked(getDinozDataForUnsacrificeRequest).mockResolvedValue(makeDinozWPlayer({ unavailableReason: null }));
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.dinozNotAvailable');
		});

		it('throws ExpectedError when Dinoz is unavailable but not sacrificed', async () => {
			vi.mocked(getDinozDataForUnsacrificeRequest).mockResolvedValue(
				makeDinozWPlayer({ unavailableReason: UnavailableReason.frozen })
			);
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.dinozNotAvailable');
		});

		it('throws ExpectedError when player does not have enough tickets', async () => {
			const LEVEL = 10;
			vi.mocked(getDinozDataForUnsacrificeRequest).mockResolvedValue(
				makeDinozWPlayer(
					{ level: LEVEL, unavailableReason: UnavailableReason.sacrificed },
					{ items: [{ itemId: Item.DEMON_TICKET, quantity: 1 }] }
				)
			);
			await expect(unsacrificeDinoz(req({ dinozId: '1' }))).rejects.toThrow('error.notEnoughTickets');
		});
	});

	// ── Processing validation ────────────────────────────────────────────────────────

	describe('processing validation', () => {
		it('normal flow', async () => {
			const LEVEL = 10;
			vi.mocked(getDinozDataForUnsacrificeRequest).mockResolvedValue(
				makeDinozWPlayer({ level: LEVEL, unavailableReason: UnavailableReason.sacrificed })
			);
			const result = await unsacrificeDinoz(req({ dinozId: '1' }));

			expect(result).toBeUndefined();

			expect(updateDinoz).toHaveBeenCalledWith(1, {
				unavailableReason: UnavailableReason.unsacrificing,
				unavailableUntil: expect.any(Date)
			});
			expect(decreaseItemQuantity).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, Item.DEMON_TICKET, getDemonShopPrice(LEVEL));
			expect(updatePoints).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, LEVEL);
			expect(updateDinozCount).toHaveBeenCalledWith(DEFAULT_PLAYER_ID, 1);
			expect(computeUSkillsForPlayer).toHaveBeenCalledOnce();
			expect(createLog).toHaveBeenCalledWith(
				LogType.Unsacrifice,
				DEFAULT_PLAYER_ID,
				DEFAULT_DINOZ_ID,
				getDemonShopPrice(LEVEL)
			);
		});
	});
});
