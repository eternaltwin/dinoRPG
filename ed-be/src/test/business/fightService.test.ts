import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Monster, monsterList } from '@drpg/core/models/fight/MonsterList';
import { STANDARD_PVP_RULES } from '@drpg/core/models/fight/FightConfiguration';
import type { DinozToGetFighter } from '@drpg/core/models/fight/FightConfiguration';

vi.mock('../../context.js', () => ({ LOGGER: { error: vi.fn(), log: vi.fn(), warn: vi.fn() }, GLOBAL: { config: {} } }));
vi.mock('../../config/game.config.js', () => ({
	default: { dinoz: { maxLevel: 60, initialMaxLevel: 40, maxQuantity: 5 }, general: {} }
}));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozFightDataRequest: vi.fn(), updateDinoz: vi.fn() }));
vi.mock('../../dao/dinozStatusDao.js', () => ({ addStatusToDinoz: vi.fn(), removeStatusFromDinoz: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn(), auth: vi.fn(), removeMoney: vi.fn() }));
vi.mock('../../dao/dinozItemDao.js', () => ({ removeItemFromDinoz: vi.fn() }));
vi.mock('../../dao/dinozCatchDao.js', () => ({ createCatch: vi.fn(), removeCatch: vi.fn(), updateCatch: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/eventsDao.js', () => ({ getPlayerEventProgression: vi.fn(), increasePlayerEventProgression: vi.fn() }));
vi.mock('../../dao/archiveDao.js', () => ({ getArchivedFightRequest: vi.fn() }));
vi.mock('../../business/missionsService.js', () => ({ checkMissionFight: vi.fn() }));
vi.mock('../../business/specialService.js', () => ({ movementListener: vi.fn() }));
vi.mock('../../utils/scenarioChecker.js', () => ({ scenarioChecker: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import * as dinozDao from '../../dao/dinozDao.js';
import * as playerDao from '../../dao/playerDao.js';
import { getPlayerEventProgression } from '../../dao/eventsDao.js';
import { getArchivedFightRequest } from '../../dao/archiveDao.js';
import { movementListener } from '../../business/specialService.js';
import {
	processFight,
	fightMonstersAtPlace,
	calculateFightVsMonsters,
	calculateFightBetweenPlayers,
	rewardFightVsMonsters,
	generateMonsterList,
	replayFight
} from '../../business/fightService.js';

const PLACE = PlaceEnum.PORT_DE_PRECHE;

let nextId = 1;
function makeDinoz(overrides: Partial<DinozToGetFighter> = {}): DinozToGetFighter {
	return {
		id: nextId++,
		playerId: 'p1',
		level: 20,
		name: 'rocky',
		life: 120,
		maxLife: 120,
		experience: 0,
		placeId: PLACE,
		nbrUpFire: 8,
		nbrUpWood: 6,
		nbrUpWater: 5,
		nbrUpLightning: 4,
		nbrUpAir: 3,
		display: 'rocky',
		items: [],
		skills: [],
		status: [],
		catches: [],
		missions: []
	} as never;
}

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	nextId = 1;
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
	vi.mocked(getPlayerEventProgression).mockResolvedValue({ dailyProgression: 0 } as never);
});

describe('calculateFightVsMonsters', () => {
	it('runs a seeded fight against monsters', () => {
		const result = calculateFightVsMonsters([makeDinoz()], { cooker: false }, PLACE, [{ ...monsterList[Monster.GOUPIGNON] }], 'seed-1');
		expect(result.outcome).toBeDefined();
		expect(result.attackers.length).toBe(1);
	});
});

describe('calculateFightBetweenPlayers', () => {
	it('runs a seeded pvp fight', () => {
		const result = calculateFightBetweenPlayers(STANDARD_PVP_RULES, [makeDinoz()], false, [makeDinoz()], false, PLACE, 1000, 'seed-pvp');
		expect(result.outcome).toBeDefined();
	});
});

describe('rewardFightVsMonsters', () => {
	it('grants rewards for a fight', async () => {
		const team = [makeDinoz({ id: 1, life: 120 })];
		const monsters = [{ ...monsterList[Monster.GOUPIGNON] }];
		const fightResult = calculateFightVsMonsters(team, { cooker: false }, PLACE, monsters, 'seed-reward');
		const result = await rewardFightVsMonsters(
			team.map(d => ({ ...d, status: [], skills: [], items: [] })) as never,
			monsters,
			fightResult,
			PLACE,
			{ id: 'p1', teacher: false }
		);
		expect(result).toHaveProperty('result');
		expect(dinozDao.updateDinoz).toHaveBeenCalled();
	});
	it('throws when team is empty', async () => {
		await expect(
			rewardFightVsMonsters([], [], { outcome: 0, attackers: [], defenders: [], fighters: [], catches: [], steps: [] } as never, PLACE, { id: 'p1', teacher: false })
		).rejects.toThrow('No player found');
	});
});

describe('generateMonsterList', () => {
	it('returns monsters appropriate for the team', async () => {
		const result = await generateMonsterList(
			[{ level: 20, placeId: PLACE, playerId: 'p1', missions: [] }] as never,
			PLACE
		);
		expect(Array.isArray(result)).toBe(true);
	});
	it('throws when the place does not exist', async () => {
		await expect(generateMonsterList([{ level: 20, placeId: 1, playerId: 'p1', missions: [] }] as never, 999999 as never)).rejects.toThrow(
			"doesn't exist"
		);
	});
});

describe('fightMonstersAtPlace', () => {
	it('generates monsters, fights and rewards', async () => {
		const team = [makeDinoz({ id: 1 })].map(d => ({ ...d, missions: [] }));
		const result = await fightMonstersAtPlace(team as never, PLACE, { id: 'p1', teacher: false, cooker: false });
		expect(result).toHaveProperty('result');
	});
});

describe('processFight', () => {
	it('throws when player not found', async () => {
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue(null as never);
		await expect(processFight(req({}, { dinozId: 1 }))).rejects.toThrow("doesn't exist");
	});
	it('runs a fight when conditions are met', async () => {
		const dinoz = { ...makeDinoz({ id: 1 }), fight: true, gather: true, unavailableReason: null, canChangeName: false, concentration: null, missions: [] };
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue({ id: 'p1', teacher: false, cooker: false, dinoz: [dinoz] } as never);
		vi.mocked(movementListener).mockResolvedValue(false as never);
		const result = await processFight(req({}, { dinozId: 1 }));
		expect(result).toBeDefined();
	});
	it('throws when dinoz is unavailable', async () => {
		const dinoz = { ...makeDinoz({ id: 1 }), unavailableReason: 'frozen', canChangeName: false };
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue({ id: 'p1', dinoz: [dinoz] } as never);
		await expect(processFight(req({}, { dinozId: 1 }))).rejects.toThrow('not able to fight');
	});
});

describe('replayFight', () => {
	it('returns a parsed replay', async () => {
		vi.mocked(getArchivedFightRequest).mockResolvedValue({
			fighters: '[]', result: true, steps: '[]', seed: 's', leftPlayer: null, rightPlayer: null, metadata: null
		} as never);
		const result = await replayFight(req({ archiveId: 'a1' }));
		expect(result.id).toBe('a1');
	});
	it('throws when no replay', async () => {
		vi.mocked(getArchivedFightRequest).mockResolvedValue(null as never);
		await expect(replayFight(req({ archiveId: 'a1' }))).rejects.toThrow('No replay found');
	});
});
