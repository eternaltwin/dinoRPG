import { describe, it, expect, vi, beforeEach } from 'vitest';

// The fight engine only touches the server context for its LOGGER. Stub it so the
// modules can be imported without spinning up Prisma / config / Discord.
vi.mock('../../../context.js', () => ({
	LOGGER: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
	GLOBAL: {}
}));

import seedrandom from 'seedrandom';
import generateFight from '../../../utils/fight/generateFight.js';
import getFighters from '../../../utils/fight/getFighters.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { Monster, monsterList } from '@drpg/core/models/fight/MonsterList';
import { MONSTER_FIGHT_RULES, STANDARD_PVP_RULES } from '@drpg/core/models/fight/FightConfiguration';
import type { DinozToGetFighter, FightConfiguration, FightRules } from '@drpg/core/models/fight/FightConfiguration';
import type { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import type { FighterTimesStep, FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterTooltipStatsTracker, NEVER_PLAYS } from '@drpg/core/utils/fighterTooltipStats';
import { FIGHT_INFINITE, TIME_FACTOR } from '@drpg/core/utils/fightConstants';

let nextId = 1;

function makeDinoz(overrides: Partial<DinozToGetFighter> = {}): DinozToGetFighter {
	return {
		id: nextId++,
		playerId: 'player-' + nextId,
		level: 20,
		name: 'rocky',
		life: 150,
		maxLife: 150,
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
		...overrides
	} as DinozToGetFighter;
}

function runFight(
	attackers: DinozToGetFighter[],
	defenders: DinozToGetFighter[],
	monsters: MonsterFiche[],
	seed: string,
	rules: FightRules
) {
	const rng = seedrandom(seed);
	const fighters = getFighters(
		{ dinozList: attackers, monsterList: [] },
		{ dinozList: defenders, monsterList: monsters },
		PlaceEnum.PORT,
		rng
	);
	const config: FightConfiguration = {
		seed,
		rules,
		attackerHasCook: false,
		defenderHasCook: false,
		initialDinozList: [...attackers, ...defenders],
		fighters,
		place: PlaceEnum.PORT
	} as FightConfiguration;
	return generateFight(config, PlaceEnum.PORT, rng);
}

const timeSteps = (steps: FightStep[]) => steps.filter((s): s is FighterTimesStep => s.action === 'fighterTimes');

const labels = {
	nextTurn: 'Next turn in',
	speed: 'Speed',
	formatSpeed: (percent: number) => `${percent}%`
};

beforeEach(() => {
	nextId = 1;
});

describe('fight engine - fighterTimes steps', () => {
	it('sends the starting time and speed of every fighter', () => {
		const result = runFight(
			[makeDinoz({ skills: [{ skillId: Skill.BRAVE }] })],
			[],
			[{ ...monsterList[Monster.WOLF] }, { ...monsterList[Monster.GOUPIGNON] }],
			'times-start',
			MONSTER_FIGHT_RULES
		);
		const first = timeSteps(result.steps)[0];

		expect(first.time).toBe(0);
		expect(first.fighters.map(f => f.fid).sort()).toEqual(result.fighters.map(f => f.id).sort());
		// Times are relative to the first fighter, which plays at time 0
		expect(Math.min(...first.fighters.map(f => f.time))).toBe(0);
		first.fighters.forEach(f => expect(f.speed).toBeGreaterThan(0));
		// Sent after the start of the fight effects (Brave), before the first turn
		const firstIndex = result.steps.indexOf(first);
		expect(result.steps.findIndex(s => s.action === 'skillAnnounce')).toBeLessThan(firstIndex);
		expect(result.steps.findIndex(s => s.action === 'newTurn')).toBeGreaterThan(firstIndex);
	});

	it('lets the front know that the fighter starting a turn has no time left', () => {
		for (let i = 0; i < 30; i++) {
			const result = runFight(
				[makeDinoz({ skills: [{ skillId: Skill.JOKER }, { skillId: Skill.DOUBLE_FACE }] }), makeDinoz()],
				[makeDinoz({ skills: [{ skillId: Skill.BRAVE }] }), makeDinoz()],
				[],
				`times-turn-${i}`,
				STANDARD_PVP_RULES
			);
			const times = new Map<number, number>();
			let fightTime = -1;
			let turns = 0;
			result.steps.forEach(step => {
				if (step.action === 'fighterTimes') {
					// The fight time never goes back
					expect(step.time).toBeGreaterThanOrEqual(fightTime);
					fightTime = step.time;
					step.fighters.forEach(f => times.set(f.fid, f.time));
				} else if (step.action === 'newTurn') {
					turns++;
					expect(times.get(step.fighter.id)).toBe(fightTime);
				}
			});
			expect(turns).toBeGreaterThan(0);
		}
	});

	it('only sends the fighters whose time or speed changed', () => {
		const result = runFight(
			[makeDinoz(), makeDinoz()],
			[makeDinoz(), makeDinoz()],
			[],
			'times-diff',
			STANDARD_PVP_RULES
		);
		const steps = timeSteps(result.steps);
		const sent = new Map<number, { time: number; speed: number }>();
		steps.forEach(step => {
			step.fighters.forEach(f => {
				const previous = sent.get(f.fid);
				if (f.speed === undefined) {
					// Speed omitted: it did not change, so the time did
					expect(previous).toBeDefined();
					expect(f.time).not.toBe(previous?.time);
				} else {
					// Speed sent: the fighter is new or its speed changed
					expect(f.speed).not.toBe(previous?.speed);
				}
				sent.set(f.fid, { time: f.time, speed: f.speed ?? previous?.speed ?? 0 });
			});
		});
		// A fight of 4 fighters plays many turns, each one only changes the fighter that played
		const sentEntries = steps.reduce((total, step) => total + step.fighters.length, 0);
		expect(sentEntries).toBeLessThan(steps.length * 4);
	});
});

describe('FighterTooltipStatsTracker', () => {
	it('displays the time before the next turn and the speed of each fighter', () => {
		const tracker = new FighterTooltipStatsTracker(labels);
		const changes = tracker.update({
			action: 'fighterTimes',
			time: 0,
			fighters: [
				{ fid: 1, time: 0, speed: 1 },
				{ fid: 2, time: 70, speed: 0.75 }
			]
		});

		expect(changes).toEqual([
			{ fid: 1, stats: { 'Next turn in': 0, Speed: '100%' } },
			{ fid: 2, stats: { 'Next turn in': 70 / TIME_FACTOR, Speed: '133%' } }
		]);
	});

	it('only returns the stats that changed', () => {
		const tracker = new FighterTooltipStatsTracker(labels);
		tracker.update({
			action: 'fighterTimes',
			time: 0,
			fighters: [
				{ fid: 1, time: 0, speed: 1 },
				{ fid: 2, time: 50, speed: 1 }
			]
		});

		// Fighter 1 played: its time moved (its speed is omitted as it did not change).
		// The fight time moved too, so fighter 2's next turn is closer.
		expect(tracker.update({ action: 'fighterTimes', time: 50, fighters: [{ fid: 1, time: 100 }] })).toEqual([
			{ fid: 1, stats: { 'Next turn in': 5 } },
			{ fid: 2, stats: { 'Next turn in': 0 } }
		]);
		// Fighter 2 got slowed but plays at the same time
		expect(tracker.update({ action: 'fighterTimes', time: 50, fighters: [{ fid: 2, time: 50, speed: 1.5 }] })).toEqual([
			{ fid: 2, stats: { Speed: '67%' } }
		]);
		// Nothing changed
		expect(tracker.update({ action: 'fighterTimes', time: 50, fighters: [] })).toEqual([]);
	});

	it('displays fighters that will not play (asleep, petrified) as never playing', () => {
		const tracker = new FighterTooltipStatsTracker(labels);
		expect(
			tracker.update({ action: 'fighterTimes', time: 20, fighters: [{ fid: 1, time: FIGHT_INFINITE + 40, speed: 1 }] })
		).toEqual([{ fid: 1, stats: { 'Next turn in': NEVER_PLAYS, Speed: '100%' } }]);
	});

	it('clears the stats of a fighter that left the fight until it is sent again', () => {
		const tracker = new FighterTooltipStatsTracker(labels);
		tracker.update({ action: 'fighterTimes', time: 0, fighters: [{ fid: 1, time: 30, speed: 1 }] });

		expect(tracker.remove(1)).toEqual({ fid: 1, stats: { 'Next turn in': null, Speed: null } });
		expect(tracker.remove(1)).toBeUndefined();
		expect(tracker.update({ action: 'fighterTimes', time: 10, fighters: [] })).toEqual([]);
		// Its speed is still known if it is not sent again (fighter revived by Phoenix feathers)
		expect(tracker.update({ action: 'fighterTimes', time: 10, fighters: [{ fid: 1, time: 30 }] })).toEqual([
			{ fid: 1, stats: { 'Next turn in': 2, Speed: '100%' } }
		]);
	});
});
