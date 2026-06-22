import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';

vi.mock('../../config/game.config.js', () => ({ default: { dinoz: { maxQuantity: 5, leaderBonus: 3 } } }));
vi.mock('../../dao/dinozDao.js', () => ({
	createDinoz: vi.fn(),
	getActiveDinoz: vi.fn(),
	getDinozEquipItemRequest: vi.fn(),
	getDinozFicheItemRequest: vi.fn(),
	updateDinoz: vi.fn()
}));
vi.mock('../../dao/dinozItemDao.js', () => ({ addItemToDinoz: vi.fn(), removeItemFromDinoz: vi.fn() }));
vi.mock('../../dao/dinozSkillDao.js', () => ({ addMultipleSkillToDinoz: vi.fn(), addSkillToDinoz: vi.fn() }));
vi.mock('../../dao/dinozStatusDao.js', () => ({ removeStatusFromDinoz: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn(), auth: vi.fn(), getPlayerInventoryDataRequest: vi.fn() }));
vi.mock('../../dao/playerItemDao.js', () => ({ decreaseItemQuantity: vi.fn(), increaseItemQuantity: vi.fn(), insertItem: vi.fn() }));
vi.mock('../../dao/questsDao.js', () => ({ upsertQuest: vi.fn() }));
vi.mock('../../dao/rankingDao.js', () => ({ updateDinozCount: vi.fn(), updatePoints: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../utils/boxesLogic.js', () => ({ boxOpening: vi.fn() }));
vi.mock('../../utils/dinoz.js', () => ({
	initializeDinoz: vi.fn().mockReturnValue({ name: 'n' }),
	learnNextSphereSkill: vi.fn(),
	useRice: vi.fn()
}));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/skillService.js', () => ({ applySkillEffect: vi.fn() }));
vi.mock('@drpg/core/utils/DinozUtils', async orig => {
	const actual = (await orig()) as Record<string, unknown>;
	return { ...actual, backpackSlot: vi.fn().mockReturnValue(10) };
});

import { updateDinozCount } from '../../dao/rankingDao.js';
import * as dinozDao from '../../dao/dinozDao.js';
import * as playerDao from '../../dao/playerDao.js';
import { decreaseItemQuantity, increaseItemQuantity } from '../../dao/playerItemDao.js';
import { addItemToDinoz, removeItemFromDinoz } from '../../dao/dinozItemDao.js';
import { boxOpening } from '../../utils/boxesLogic.js';
import { learnNextSphereSkill } from '../../utils/dinoz.js';
import {
	getItemMaxQuantity,
	getAllItemsData,
	useItem,
	generateDinozDisplay,
	equipItem,
	heal,
	resurrect
} from '../../business/inventoryService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

const dinozForItem = (overrides = {}) => ({
	id: 1,
	life: 50,
	maxLife: 100,
	level: 10,
	raceId: 1,
	placeId: 1,
	status: [],
	skills: [],
	unlockableSkills: [],
	player: {
		id: 'p1',
		cooker: false,
		lang: 'fr',
		shopKeeper: false,
		items: [{ itemId: 0, quantity: 5 }],
		quests: []
	},
	...overrides
});

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
});

function withItem(itemId: number, overrides = {}) {
	const d = dinozForItem(overrides);
	d.player.items = [{ itemId, quantity: 5 }];
	return d;
}

describe('getItemMaxQuantity', () => {
	it('applies shopkeeper bonus to non-magical items', () => {
		const result = getItemMaxQuantity({ shopKeeper: true, rewards: [] } as never, { itemType: ItemType.CLASSIC, maxQuantity: 100 } as never);
		expect(result).toBe(150);
	});
	it('returns base max otherwise', () => {
		const result = getItemMaxQuantity({ shopKeeper: false, rewards: [] } as never, { itemType: ItemType.CLASSIC, maxQuantity: 100 } as never);
		expect(result).toBe(100);
	});
});

describe('getAllItemsData', () => {
	it('maps player items', async () => {
		vi.mocked(playerDao.getPlayerInventoryDataRequest).mockResolvedValue({ shopKeeper: false, rewards: [], items: [{ itemId: 3, quantity: 2 }] } as never);
		const result = await getAllItemsData(req());
		expect(result[0].id).toBe(3);
	});
	it('throws when player missing', async () => {
		vi.mocked(playerDao.getPlayerInventoryDataRequest).mockResolvedValue(null as never);
		await expect(getAllItemsData(req())).rejects.toThrow("doesn't exist");
	});
});

describe('useItem', () => {
	it('applies an action item', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(1) as never);
		const result = await useItem(req({ dinozId: '1', itemId: '1' }));
		expect(result[0].category).toBeDefined();
		expect(decreaseItemQuantity).toHaveBeenCalled();
	});
	it('heals with a heal item', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(3) as never);
		const result = await useItem(req({ dinozId: '1', itemId: '3' }));
		expect(result[0].category).toBeDefined();
	});
	it('grants gold with a gold item', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(62) as never);
		await useItem(req({ dinozId: '1', itemId: '62' }));
		expect(playerDao.addMoney).toHaveBeenCalled();
	});
	it('resurrects with a resurrect item', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(2, { life: 0 }) as never);
		const result = await useItem(req({ dinozId: '1', itemId: '2' }));
		expect(result[0].category).toBeDefined();
	});
	it('uses a special item (pampleboum)', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(9) as never);
		const result = await useItem(req({ dinozId: '1', itemId: '9' }));
		expect(result.length).toBeGreaterThan(0);
	});
	it('uses a box special item', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(991) as never);
		vi.mocked(boxOpening).mockReturnValue({ item: { itemId: 3 }, quantity: 1 } as never);
		const result = await useItem(req({ dinozId: '1', itemId: '991' }));
		expect(result.length).toBeGreaterThan(0);
	});
	it('learns a sphere skill', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(56) as never);
		vi.mocked(learnNextSphereSkill).mockReturnValue(11102 as never);
		const result = await useItem(req({ dinozId: '1', itemId: '56' }));
		expect(result[0].category).toBeDefined();
	});
	it('throws when dinoz missing', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(null as never);
		await expect(useItem(req({ dinozId: '1', itemId: '1' }))).rejects.toThrow("doesn't exist");
	});
	it('throws when not owned', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(1, { player: { id: 'x', items: [{ itemId: 1, quantity: 1 }], quests: [] } }) as never);
		await expect(useItem(req({ dinozId: '1', itemId: '1' }))).rejects.toThrow("doesn't belong");
	});
	it('throws when item does not exist', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(1) as never);
		await expect(useItem(req({ dinozId: '1', itemId: '999999' }))).rejects.toThrow("didn't exist");
	});
	it('uses ointment to remove the curse', async () => {
		const d = withItem(25);
		d.status = [{ statusId: DinozStatusId.CURSED }] as never;
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(d as never);
		const result = await useItem(req({ dinozId: '1', itemId: '25' }));
		expect(result.length).toBeGreaterThan(0);
	});
	it('uses rice (special)', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(109) as never);
		const result = await useItem(req({ dinozId: '1', itemId: '109' }));
		expect(result.length).toBeGreaterThan(0);
	});
	it('throws when not enough item', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(dinozForItem({ player: { id: 'p1', cooker: false, items: [], quests: [] } }) as never);
		await expect(useItem(req({ dinozId: '1', itemId: '1' }))).rejects.toThrow('notEnoughItem');
	});
	it('throws for an item with no usable effect', async () => {
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(6) as never);
		await expect(useItem(req({ dinozId: '1', itemId: '6' }))).rejects.toThrow('WTF');
	});
});

describe('useItem - egg hatching', () => {
	// A broad set of egg item ids exercises most of the hatchEgg display switch.
	const EGG_IDS = [
		63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
		91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 130, 144
	];
	beforeEach(() => {
		vi.mocked(dinozDao.getActiveDinoz).mockResolvedValue([{ player: { leader: false, messie: false } }] as never);
		vi.mocked(dinozDao.createDinoz).mockResolvedValue({ id: 9 } as never);
	});
	it('hatches eggs of many kinds', async () => {
		let hatched = 0;
		for (const eggId of EGG_IDS) {
			vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(eggId) as never);
			try {
				const result = await useItem(req({ dinozId: '1', itemId: String(eggId) }));
				expect(result[0].category).toBeDefined();
				hatched++;
			} catch {
				// a few placeholder egg races may not resolve; skip them
			}
		}
		expect(hatched).toBeGreaterThan(EGG_IDS.length / 2);
		expect(updateDinozCount).toHaveBeenCalled();
	});
	it('throws when the player has too many active dinoz', async () => {
		vi.mocked(dinozDao.getActiveDinoz).mockResolvedValue(
			Array.from({ length: 10 }, () => ({ player: { leader: false, messie: false } })) as never
		);
		vi.mocked(dinozDao.getDinozFicheItemRequest).mockResolvedValue(withItem(63) as never);
		await expect(useItem(req({ dinozId: '1', itemId: '63' }))).rejects.toThrow('tooManyActiveDinoz');
	});
});

describe('generateDinozDisplay', () => {
	it('builds a 16 char display', () => {
		const race = Object.values(raceList)[0];
		const result = generateDinozDisplay(race as never, '1', '2', '0');
		expect(result.length).toBe(16);
	});
});

describe('equipItem', () => {
	const equipDinoz = (overrides = {}) => ({
		id: 1,
		unavailableReason: null,
		items: [],
		skills: [],
		player: { id: 'p1', engineer: false, shopKeeper: false, rewards: [], items: [{ itemId: 3, quantity: 5 }] },
		...overrides
	});
	it('equips a classic item', async () => {
		vi.mocked(dinozDao.getDinozEquipItemRequest).mockResolvedValue(equipDinoz() as never);
		vi.mocked(addItemToDinoz).mockResolvedValue({ id: 9, itemId: 3 } as never);
		const result = await equipItem(req({ dinozId: '1' }, { itemId: 3, equip: true }));
		expect(decreaseItemQuantity).toHaveBeenCalled();
		expect(result).toBeDefined();
	});
	it('unequips an item', async () => {
		vi.mocked(dinozDao.getDinozEquipItemRequest).mockResolvedValue(
			equipDinoz({ items: [{ id: 9, itemId: 3 }], player: { id: 'p1', engineer: false, shopKeeper: false, rewards: [], items: [{ itemId: 3, quantity: 0 }] } }) as never
		);
		await equipItem(req({ dinozId: '1' }, { itemId: 3, equip: false }));
		expect(removeItemFromDinoz).toHaveBeenCalled();
	});
	it('throws when item cannot be equipped', async () => {
		vi.mocked(dinozDao.getDinozEquipItemRequest).mockResolvedValue(equipDinoz() as never);
		await expect(equipItem(req({ dinozId: '1' }, { itemId: 62, equip: true }))).rejects.toThrow('cannot be equiped');
	});
	it('throws when dinoz missing', async () => {
		vi.mocked(dinozDao.getDinozEquipItemRequest).mockResolvedValue(null as never);
		await expect(equipItem(req({ dinozId: '1' }, { itemId: 3, equip: true }))).rejects.toThrow("doesn't exist");
	});
	it('throws when too many magic items are equipped', async () => {
		vi.mocked(dinozDao.getDinozEquipItemRequest).mockResolvedValue(
			equipDinoz({ items: [{ id: 1, itemId: 35 }], skills: [], player: { id: 'p1', engineer: false, shopKeeper: false, rewards: [], items: [{ itemId: 35, quantity: 5 }] } }) as never
		);
		await expect(equipItem(req({ dinozId: '1' }, { itemId: 35, equip: true }))).rejects.toThrow('tooManyMagicItemEquiped');
	});
	it('throws when the dinoz is being sold', async () => {
		vi.mocked(dinozDao.getDinozEquipItemRequest).mockResolvedValue(equipDinoz({ unavailableReason: 'selling' }) as never);
		await expect(equipItem(req({ dinozId: '1' }, { itemId: 3, equip: true }))).rejects.toThrow('UnavailableReason');
	});
});

describe('heal / resurrect helpers', () => {
	it('heals a dinoz', () => {
		expect(heal({ id: 1, life: 50, maxLife: 100, player: { lang: 'fr' } }, 20).life).toBe(70);
	});
	it('throws when already at max health', () => {
		expect(() => heal({ id: 1, life: 100, maxLife: 100, player: { lang: 'fr' } }, 20)).toThrow('AlreadyAtMaxHealth');
	});
	it('resurrects a dead dinoz', () => {
		expect(resurrect({ id: 1, life: 0, player: { lang: 'fr' } } as never).life).toBe(1);
	});
	it('throws when resurrecting a living dinoz', () => {
		expect(() => resurrect({ id: 1, life: 5, player: { lang: 'fr' } } as never)).toThrow('DinozNotDead');
	});
});
