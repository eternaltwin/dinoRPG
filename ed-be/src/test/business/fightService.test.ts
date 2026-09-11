import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Monster, monsterList } from '@drpg/core/models/fight/MonsterList';
import { STANDARD_PVP_RULES } from '@drpg/core/models/fight/FightConfiguration';
import { groupGoldMultiplier, groupXpMultiplier } from '@drpg/core/constants';
import type { DinozToGetFighter } from '@drpg/core/models/fight/FightConfiguration';

vi.mock('../../context.js', () => ({
	LOGGER: { error: vi.fn(), log: vi.fn(), warn: vi.fn() },
	GLOBAL: { config: {} }
}));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozFightDataRequest: vi.fn(), updateDinoz: vi.fn() }));
vi.mock('../../dao/dinozStatusDao.js', () => ({ addStatusToDinoz: vi.fn(), removeStatusFromDinoz: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn(), auth: vi.fn(), removeMoney: vi.fn() }));
vi.mock('../../dao/dinozItemDao.js', () => ({ removeItemFromDinoz: vi.fn() }));
vi.mock('../../dao/dinozCatchDao.js', () => ({ createCatch: vi.fn(), removeCatch: vi.fn(), updateCatch: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/eventsDao.js', () => ({
	getPlayerEventProgression: vi.fn(),
	increasePlayerEventProgression: vi.fn()
}));
vi.mock('../../dao/archiveDao.js', () => ({ getArchivedFightRequest: vi.fn() }));
vi.mock('../../business/missionsService.js', () => ({ checkMissionFight: vi.fn() }));
vi.mock('../../business/specialService.js', () => ({ movementListener: vi.fn() }));
vi.mock('../../utils/scenarioChecker.js', () => ({ scenarioChecker: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { createCatch, removeCatch, updateCatch } from '../../dao/dinozCatchDao.js';
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
		const result = calculateFightVsMonsters(
			[makeDinoz()],
			{ cooker: false },
			PLACE,
			[{ ...monsterList[Monster.GOUPIGNON] }],
			'seed-1'
		);
		expect(result.outcome).toBeDefined();
		expect(result.attackers.length).toBe(1);
	});
});

describe('calculateFightBetweenPlayers', () => {
	it('runs a seeded pvp fight', () => {
		const result = calculateFightBetweenPlayers(
			STANDARD_PVP_RULES,
			[makeDinoz()],
			false,
			[makeDinoz()],
			false,
			PLACE,
			1000,
			'seed-pvp'
		);
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
			rewardFightVsMonsters(
				[],
				[],
				{ outcome: 0, attackers: [], defenders: [], fighters: [], catches: [], steps: [] } as never,
				PLACE,
				{ id: 'p1', teacher: false }
			)
		).rejects.toThrow('No player found');
	});

	it('handles a defeat with gold loss and catch lifecycle', async () => {
		const team = [{ id: 1, level: 20, experience: 0, life: 120, placeId: PLACE, status: [], skills: [], items: [] }];
		const monsters = [{ ...monsterList[Monster.GOUPIGNON] }];
		const fightResult = {
			outcome: FightOutcome.DefenderWin,
			attackers: [{ dinozId: 1, hpLost: 10, statusGained: [], itemsUsed: [], goldLost: 5, playerId: 'p1' }],
			defenders: [],
			fighters: [
				{
					id: 1,
					type: 'dinoz',
					name: 'd',
					level: 20,
					survived: true,
					display: 'x',
					attacker: true,
					maxHp: 120,
					startingHp: 120,
					energy: 0,
					maxEnergy: 0,
					energyRecovery: 0
				}
			],
			catches: [
				{ id: null, dinozId: 1, monsterId: Monster.GOUPIGNON, hp: 5 },
				{ id: null, dinozId: 1, monsterId: Monster.GOUPIGNON, hp: 0 },
				{ id: 3, dinozId: 1, monsterId: Monster.GOUPIGNON, hp: 10 },
				{ id: 4, dinozId: 1, monsterId: Monster.GOUPIGNON, hp: 0 }
			],
			steps: []
		};
		const result = await rewardFightVsMonsters(team as never, monsters, fightResult as never, PLACE, {
			id: 'p1',
			teacher: false
		});
		expect(result.result).toBe(false);
		expect(playerDao.removeMoney).toHaveBeenCalled();
		expect(createCatch).toHaveBeenCalled();
		expect(updateCatch).toHaveBeenCalled();
		expect(removeCatch).toHaveBeenCalled();
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
		await expect(
			generateMonsterList([{ level: 20, placeId: 1, playerId: 'p1', missions: [] }] as never, 999999 as never)
		).rejects.toThrow("doesn't exist");
	});

	// The padding added after each draw used to be a quarter of the target, which capped the
	// number of draws at ~4 however large the team was: a group of four met as few monsters
	// as a lone Dinoz, then split the reward four ways.
	it('grows the monster pool with the size of the team', async () => {
		const averageCount = async (size: number) => {
			const runs = 100;
			let total = 0;
			for (let i = 0; i < runs; i++) {
				const team = Array.from({ length: size }, () => ({
					level: 20,
					placeId: PLACE,
					playerId: 'p1',
					missions: []
				}));
				total += (await generateMonsterList(team as never, PLACE)).length;
			}
			return total / runs;
		};

		const solo = await averageCount(1);
		const duo = await averageCount(2);
		const four = await averageCount(4);

		expect(duo).toBeGreaterThan(solo);
		expect(four).toBeGreaterThan(duo);
	});
});

describe('group rewards', () => {
	const rewardTeam = (size: number, level: number) =>
		Array.from({ length: size }, (_, i) => ({
			id: i + 1,
			level,
			experience: 0,
			life: 200,
			placeId: PLACE,
			status: [],
			skills: [],
			items: []
		}));

	const victoryOver = (team: { id: number }[]) => ({
		outcome: FightOutcome.AttackerWin,
		attackers: team.map(d => ({
			dinozId: d.id,
			hpLost: 0,
			statusGained: [],
			itemsUsed: [],
			goldLost: 0,
			playerId: 'p1'
		})),
		defenders: [],
		fighters: [],
		catches: [],
		steps: []
	});

	// Measures the whole loop, pool included: the bonus only shows up end to end, since the
	// share each Dinoz keeps is smaller but applies to a pool that grew with the team.
	const averageXpPerDinoz = async (size: number, level: number) => {
		const runs = 150;
		let total = 0;
		for (let i = 0; i < runs; i++) {
			vi.mocked(dinozDao.updateDinoz).mockClear();
			const team = rewardTeam(size, level);
			const monsters = await generateMonsterList(
				team.map(d => ({ level: d.level, placeId: PLACE, playerId: 'p1', missions: [] })) as never,
				PLACE
			);
			await rewardFightVsMonsters(team as never, monsters, victoryOver(team) as never, PLACE, {
				id: 'p1',
				teacher: false
			});
			const granted = vi
				.mocked(dinozDao.updateDinoz)
				.mock.calls.map(call => (call[1] as { experience?: { increment: number } }).experience?.increment ?? 0)
				.reduce((a, b) => a + b, 0);
			total += granted / size;
		}
		return total / runs;
	};

	it('splits the monster xp so the shares add up to more than 100%', () => {
		// A lone Dinoz keeps everything, a duo keeps 75% each, and the total is capped from 4.
		expect(groupXpMultiplier(1)).toBe(1);
		expect(groupXpMultiplier(2) / 2).toBe(0.75);
		expect(groupXpMultiplier(3)).toBe(2);
		expect(groupXpMultiplier(4)).toBe(2.5);
		expect(groupXpMultiplier(6)).toBe(2.5);
	});

	it('gives gold only a damped share of the same bonus', () => {
		expect(groupGoldMultiplier(1)).toBe(1);
		for (const size of [2, 3, 4, 6]) {
			expect(groupGoldMultiplier(size)).toBeGreaterThan(1);
			expect(groupGoldMultiplier(size)).toBeLessThan(groupXpMultiplier(size));
		}
	});

	it('makes a team of four out-earn the same Dinoz fighting alone', async () => {
		const solo = await averageXpPerDinoz(1, 20);
		const four = await averageXpPerDinoz(4, 20);

		expect(four).toBeGreaterThan(solo);
	});
});

describe('fightMonstersAtPlace', () => {
	it('generates monsters, fights and rewards', async () => {
		const team = [makeDinoz({ id: 1 })].map(d => ({ ...d, missions: [] }));
		const result = await fightMonstersAtPlace(team as never, PLACE, { id: 'p1', teacher: false, cooker: false });
		expect(result).toHaveProperty('result');
	});
	it('checks mission progress for dinoz on a mission', async () => {
		const team = [{ ...makeDinoz({ id: 1 }), missions: [{ missionId: 5, isFinished: false }] }];
		const result = await fightMonstersAtPlace(team as never, PLACE, { id: 'p1', teacher: false, cooker: false });
		expect(result).toHaveProperty('result');
	});
});

describe('processFight', () => {
	it('throws when player not found', async () => {
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue(null as never);
		await expect(processFight(req({}, { dinozId: 1 }))).rejects.toThrow('playerNotFound');
	});
	it('runs a fight when conditions are met', async () => {
		const dinoz = {
			...makeDinoz({ id: 1 }),
			fight: true,
			gather: true,
			unavailableReason: null,
			canChangeName: false,
			concentration: null,
			missions: []
		};
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue({
			id: 'p1',
			teacher: false,
			cooker: false,
			dinoz: [dinoz]
		} as never);
		vi.mocked(movementListener).mockResolvedValue(false as never);
		const result = await processFight(req({}, { dinozId: 1 }));
		expect(result).toBeDefined();
	});
	it('throws when dinoz is unavailable', async () => {
		const dinoz = { ...makeDinoz({ id: 1 }), unavailableReason: 'frozen', canChangeName: false };
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue({ id: 'p1', dinoz: [dinoz] } as never);
		await expect(processFight(req({}, { dinozId: 1 }))).rejects.toThrow('not able to fight');
	});

	it('uses the special movement fight when one occurs and drops unavailable followers', async () => {
		const leader = {
			...makeDinoz({ id: 1 }),
			fight: true,
			gather: true,
			unavailableReason: null,
			canChangeName: false,
			concentration: null,
			missions: []
		};
		const deadFollower = {
			...makeDinoz({ id: 2 }),
			life: 0,
			fight: true,
			unavailableReason: null,
			canChangeName: false,
			concentration: null,
			missions: []
		};
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue({
			id: 'p1',
			teacher: false,
			cooker: false,
			dinoz: [leader, deadFollower]
		} as never);
		vi.mocked(movementListener).mockResolvedValue({ result: true, fighters: [] } as never);
		const result = await processFight(req({}, { dinozId: 1 }));
		expect(result).toEqual({ result: true, fighters: [] });
		expect(dinozDao.updateDinoz).toHaveBeenCalled();
	});

	it('throws when the dinoz still needs naming', async () => {
		const dinoz = { ...makeDinoz({ id: 1 }), canChangeName: true, unavailableReason: null };
		vi.mocked(dinozDao.getDinozFightDataRequest).mockResolvedValue({ id: 'p1', dinoz: [dinoz] } as never);
		await expect(processFight(req({}, { dinozId: 1 }))).rejects.toThrow('has to be named');
	});
});

describe('replayFight', () => {
	it('returns a parsed replay', async () => {
		vi.mocked(getArchivedFightRequest).mockResolvedValue({
			fighters: '[]',
			result: true,
			steps: '[]',
			seed: 's',
			leftPlayer: null,
			rightPlayer: null,
			metadata: null
		} as never);
		const result = await replayFight(req({ archiveId: 'a1' }));
		expect(result.id).toBe('a1');
	});
	it('throws when no replay', async () => {
		vi.mocked(getArchivedFightRequest).mockResolvedValue(null as never);
		await expect(replayFight(req({ archiveId: 'a1' }))).rejects.toThrow('No replay found');
	});
});
