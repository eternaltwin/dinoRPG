import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scenario } from '@drpg/core/models/enums/Scenario';
import { Item } from '@drpg/core/models/item/ItemList';
import { Monster } from '@drpg/core/models/fight/MonsterList';

// Mock the quest query and the quest mutations so the scenario branches can be exercised
// without a database.
vi.mock('../../prisma.js', () => ({
	prisma: { playerQuest: { findMany: vi.fn() } }
}));
vi.mock('../../dao/questsDao.js', () => ({
	increaseQuestProgression: vi.fn(),
	upsertQuest: vi.fn()
}));

import { prisma } from '../../prisma.js';
import { increaseQuestProgression, upsertQuest } from '../../dao/questsDao.js';
import { scenarioChecker } from '../../utils/scenarioChecker.js';

const mockFindMany = vi.mocked(prisma.playerQuest.findMany);
const mockUpsert = vi.mocked(upsertQuest);
const mockIncrease = vi.mocked(increaseQuestProgression);

// Minimal fight result: only the `itemsUsed` arrays of the fighters are read.
const fightWith = (items: Item[]) => ({ attackers: [{ itemsUsed: items }], defenders: [{ itemsUsed: [] }] }) as never;
const monstersOf = (...ids: Monster[]) => ids.map(id => ({ id })) as never;

beforeEach(() => {
	vi.clearAllMocks();
});

describe('scenarioChecker - MERGUEZ', () => {
	it('advances to step 2 when the tracked merguez count reaches 500', async () => {
		mockFindMany.mockResolvedValue([{ questId: Scenario.MERGUEZ, progression: 1, tracking: 499 }] as never);
		await scenarioChecker('player-1', fightWith([Item.GOBLIN_MERGUEZ]), []);
		expect(mockUpsert).toHaveBeenCalledWith('player-1', Scenario.MERGUEZ, 2);
	});

	it('advances to step 4 when reaching 2000 on step 3', async () => {
		mockFindMany.mockResolvedValue([{ questId: Scenario.MERGUEZ, progression: 3, tracking: 1999 }] as never);
		await scenarioChecker('player-1', fightWith([Item.GOBLIN_MERGUEZ]), []);
		expect(mockUpsert).toHaveBeenCalledWith('player-1', Scenario.MERGUEZ, 4);
	});

	it('increments progress when still below the threshold', async () => {
		mockFindMany.mockResolvedValue([{ questId: Scenario.MERGUEZ, progression: 1, tracking: 0 }] as never);
		await scenarioChecker('player-1', fightWith([Item.GOBLIN_MERGUEZ, Item.GOBLIN_MERGUEZ]), []);
		expect(mockIncrease).toHaveBeenCalledWith('player-1', Scenario.MERGUEZ, 0, 2);
		expect(mockUpsert).not.toHaveBeenCalled();
	});

	it('does nothing when no merguez was used', async () => {
		mockFindMany.mockResolvedValue([{ questId: Scenario.MERGUEZ, progression: 1, tracking: 0 }] as never);
		await scenarioChecker('player-1', fightWith([]), []);
		expect(mockIncrease).not.toHaveBeenCalled();
		expect(mockUpsert).not.toHaveBeenCalled();
	});
});

describe('scenarioChecker - PAC', () => {
	it('advances to step 6 when enough KAZKA are killed', async () => {
		mockFindMany.mockResolvedValue([{ questId: Scenario.PAC, progression: 5, tracking: 49 }] as never);
		await scenarioChecker('player-1', fightWith([]), monstersOf(Monster.KAZKA));
		expect(mockUpsert).toHaveBeenCalledWith('player-1', Scenario.PAC, 6);
	});

	it('increments KAZKA progress when below the threshold', async () => {
		mockFindMany.mockResolvedValue([{ questId: Scenario.PAC, progression: 5, tracking: 0 }] as never);
		await scenarioChecker('player-1', fightWith([]), monstersOf(Monster.KAZKA, Monster.KAZKA));
		expect(mockIncrease).toHaveBeenCalledWith('player-1', Scenario.PAC, 0, 2);
		expect(mockUpsert).not.toHaveBeenCalled();
	});

	it('advances to step 10 when a COQDUR is killed on step 9', async () => {
		mockFindMany.mockResolvedValue([{ questId: Scenario.PAC, progression: 9, tracking: 0 }] as never);
		await scenarioChecker('player-1', fightWith([]), monstersOf(Monster.COQDUR));
		expect(mockUpsert).toHaveBeenCalledWith('player-1', Scenario.PAC, 10);
	});
});

describe('scenarioChecker - other quests', () => {
	it('ignores quests it does not handle', async () => {
		mockFindMany.mockResolvedValue([{ questId: 999, progression: 1, tracking: 0 }] as never);
		await scenarioChecker('player-1', fightWith([Item.GOBLIN_MERGUEZ]), monstersOf(Monster.KAZKA));
		expect(mockUpsert).not.toHaveBeenCalled();
		expect(mockIncrease).not.toHaveBeenCalled();
	});
});
