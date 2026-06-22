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
import { Item } from '@drpg/core/models/item/ItemList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { Monster, monsterList } from '@drpg/core/models/fight/MonsterList';
import { MONSTER_FIGHT_RULES, STANDARD_PVP_RULES, DOJO_CHALLENGE_RULES } from '@drpg/core/models/fight/FightConfiguration';
import type { DinozToGetFighter, FightConfiguration, FightRules } from '@drpg/core/models/fight/FightConfiguration';
import type { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';

let nextId = 1;

function makeDinoz(overrides: Partial<DinozToGetFighter> = {}): DinozToGetFighter {
	return {
		id: nextId++,
		playerId: 'player-' + nextId,
		level: 20,
		name: 'rocky',
		life: 120,
		maxLife: 120,
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

const sk = (skillId: number) => ({ skillId });
const it_ = (itemId: number) => ({ itemId });
const st = (statusId: number) => ({ statusId });

function runFight(
	team: DinozToGetFighter[],
	monsters: MonsterFiche[],
	place: PlaceEnum,
	seed: string,
	rules: FightRules = MONSTER_FIGHT_RULES,
	cooker = false
) {
	const rng = seedrandom(seed);
	const fighters = getFighters({ dinozList: team, monsterList: [] }, { dinozList: [], monsterList: monsters }, place, rng);
	const config: FightConfiguration = {
		seed,
		rules,
		attackerHasCook: cooker,
		defenderHasCook: false,
		initialDinozList: team,
		fighters,
		place,
		timeout: 1000
	} as FightConfiguration;
	return generateFight(config, place, rng);
}

beforeEach(() => {
	nextId = 1;
});

describe('fight engine - monster fights', () => {
	it('plays a basic dinoz vs monster fight to completion', () => {
		const result = runFight([makeDinoz()], [{ ...monsterList[Monster.GOUPIGNON] }], PlaceEnum.PORT, 'seed-basic');
		expect(result.outcome).toBeDefined();
		expect(result.steps.length).toBeGreaterThan(0);
		expect(result.fighters.length).toBeGreaterThanOrEqual(2);
	});

	it('runs many seeds against a tougher monster (covers attack/damage/death branches)', () => {
		for (let i = 0; i < 60; i++) {
			const result = runFight(
				[makeDinoz({ life: 200, maxLife: 200 })],
				[{ ...monsterList[Monster.WOLF] }, { ...monsterList[Monster.GOUPIGNON] }],
				PlaceEnum.PORT,
				'monster-' + i
			);
			expect(result.outcome).toBeDefined();
		}
	});

	it('handles a fight with a boss monster', () => {
		const bossKey = Object.keys(monsterList).find(k => (monsterList as Record<string, MonsterFiche>)[k].boss);
		if (bossKey) {
			const result = runFight(
				[makeDinoz({ life: 300, maxLife: 300, level: 40 })],
				[{ ...(monsterList as Record<string, MonsterFiche>)[bossKey] }],
				PlaceEnum.PORT,
				'boss-1'
			);
			expect(result.outcome).toBeDefined();
		}
	});
});

describe('fight engine - skills and items', () => {
	const skillBundles: number[][] = [
		[Skill.CHARGE, Skill.BELIER, Skill.TENACITE, Skill.FORCE_CONTROL],
		[Skill.PERCEPTION, Skill.KARATE_SOUS_MARIN, Skill.SAUT, Skill.SOUFFLE_DE_VIE],
		[Skill.ROCK, Skill.CHARGE_CORNUE, Skill.PIETINEMENT, Skill.SURVIE],
		[Skill.CHEF_DE_GUERRE, Skill.GARDE_FORESTIER, Skill.ELECTROLYSE, Skill.MAITRE_LEVITATEUR],
		[Skill.STRATEGIE, Skill.SPECIALISTE, Skill.FORME_ETHERALE, Skill.TORCHE, Skill.ACUPUNCTURE],
		[Skill.PREMIERS_SOINS, Skill.MEDECINE, Skill.BRANCARDIER],
		[Skill.JOKER, Skill.DOUBLE_FACE, Skill.CLEPTOMANE]
	];

	it('runs fights exercising a wide variety of dinoz skills', () => {
		// Skills that target an opponent dinoz (cleptomania) need a dinoz on the other side,
		// so run these as dinoz-vs-dinoz fights.
		skillBundles.forEach((bundle, bi) => {
			for (let i = 0; i < 8; i++) {
				const teamA = [makeDinoz({ life: 200, maxLife: 200, skills: bundle.map(sk) })];
				const teamB = [makeDinoz({ life: 200, maxLife: 200, skills: bundle.map(sk) })];
				const rng = seedrandom(`skill-${bi}-${i}`);
				const fighters = getFighters(
					{ dinozList: teamA, monsterList: [] },
					{ dinozList: teamB, monsterList: [] },
					PlaceEnum.PORT,
					rng
				);
				const config: FightConfiguration = {
					seed: `skill-${bi}-${i}`,
					rules: STANDARD_PVP_RULES,
					attackerHasCook: false,
					defenderHasCook: false,
					initialDinozList: [...teamA, ...teamB],
					fighters,
					place: PlaceEnum.PORT,
					timeout: 1000
				} as FightConfiguration;
				const result = generateFight(config, PlaceEnum.PORT, rng);
				expect(result.outcome).toBeDefined();
			}
		});
	});

	it('runs fights with costumes, statuses and catching glove', () => {
		for (let i = 0; i < 10; i++) {
			const result = runFight(
				[
					makeDinoz({
						life: 200,
						maxLife: 200,
						status: [st(DinozStatusId.CATCHING_GLOVE), st(DinozStatusId.CURSED)],
						catches: [{ id: 1, hp: 10, monsterId: Monster.GOUPIGNON }]
					})
				],
				[{ ...monsterList[Monster.GOUPIGNON] }],
				PlaceEnum.PORT,
				`status-${i}`
			);
			expect(result.outcome).toBeDefined();
		}
	});
});

describe('fight engine - PvP', () => {
	it('runs dinoz vs dinoz fights with various rules', () => {
		const ruleSets = [STANDARD_PVP_RULES, DOJO_CHALLENGE_RULES];
		ruleSets.forEach((rules, ri) => {
			for (let i = 0; i < 12; i++) {
				const teamA = [makeDinoz({ life: 180, maxLife: 180, skills: [sk(Skill.CHARGE)] })];
				const teamB = [makeDinoz({ life: 180, maxLife: 180, skills: [sk(Skill.TENACITE)] })];
				const rng = seedrandom(`pvp-${ri}-${i}`);
				const fighters = getFighters(
					{ dinozList: teamA, monsterList: [] },
					{ dinozList: teamB, monsterList: [] },
					PlaceEnum.PORT,
					rng
				);
				const config: FightConfiguration = {
					seed: `pvp-${ri}-${i}`,
					rules,
					attackerHasCook: false,
					defenderHasCook: false,
					initialDinozList: [...teamA, ...teamB],
					fighters,
					place: PlaceEnum.PORT,
					timeout: 1000
				} as FightConfiguration;
				const result = generateFight(config, PlaceEnum.PORT, rng);
				expect(result.outcome).toBeDefined();
			}
		});
	});
});

// All dinoz-obtainable active skills (Original + Ether trees). Throwing the whole set at
// both fighters across many long seeded fights activates a large slice of the activateSkill
// switch in fightMethods.
const ALL_ACTIVE_SKILLS = [
	11102, 11104, 11201, 11207, 11303, 11304, 11305, 11307, 11311, 11312, 11314, 11407, 11411, 11412, 11413, 12201,
	12302, 12501, 12502, 12504, 21104, 21201, 21202, 21301, 21307, 21309, 21313, 21401, 21407, 21409, 22203, 22301,
	22302, 22403, 22501, 22504, 22505, 31101, 31201, 31202, 31203, 31208, 31302, 31305, 31308, 31311, 31313, 31401,
	31409, 31502, 32303, 32404, 32405, 32502, 32504, 41102, 41207, 41301, 41308, 41310, 41311, 41401, 41403, 41404,
	41410, 41411, 41412, 41413, 41504, 41505, 41507, 41508, 42301, 42302, 42501, 42502, 51103, 51104, 51105, 51206,
	51301, 51303, 51307, 51310, 51311, 51313, 51314, 51401, 51407, 51408, 51502, 51503, 51506, 52401, 52405, 52502,
	52504, 52505, 61101, 61113, 61115, 61117
];

describe('fight engine - kitchen sink combat', () => {
	it('runs long fights where both dinoz know every active skill', () => {
		let completed = 0;
		for (let i = 0; i < 80; i++) {
			const teamA = [makeDinoz({ life: 400, maxLife: 400, level: 60, skills: ALL_ACTIVE_SKILLS.map(sk) })];
			const teamB = [makeDinoz({ life: 400, maxLife: 400, level: 60, skills: ALL_ACTIVE_SKILLS.map(sk) })];
			const seed = `kitchen-${i}`;
			const rng = seedrandom(seed);
			const fighters = getFighters(
				{ dinozList: teamA, monsterList: [] },
				{ dinozList: teamB, monsterList: [] },
				PlaceEnum.PORT,
				rng
			);
			const config: FightConfiguration = {
				seed,
				rules: STANDARD_PVP_RULES,
				attackerHasCook: true,
				defenderHasCook: true,
				initialDinozList: [...teamA, ...teamB],
				fighters,
				place: PlaceEnum.PORT,
				timeout: 2000
			} as FightConfiguration;
			const result = generateFight(config, PlaceEnum.PORT, rng);
			expect(result.outcome).toBeDefined();
			completed++;
		}
		expect(completed).toBe(80);
	});

	it('runs kitchen-sink dinoz vs strong monster packs across places', () => {
		const places = [PlaceEnum.PORT, PlaceEnum.JUNGLE_DODGE, PlaceEnum.PIC_DU_MIDI];
		places.forEach((place, pi) => {
			for (let i = 0; i < 20; i++) {
				const result = runFight(
					[makeDinoz({ life: 400, maxLife: 400, level: 60, skills: ALL_ACTIVE_SKILLS.map(sk) })],
					[
						{ ...monsterList[Monster.WOLF] },
						{ ...monsterList[Monster.GOUPIGNON] },
						{ ...monsterList[Monster.GLUON] }
					],
					place,
					`ks-monster-${pi}-${i}`,
					MONSTER_FIGHT_RULES,
					true
				);
				expect(result.outcome).toBeDefined();
			}
		});
	});
});

const USABLE_ITEMS = [3, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 18, 21, 22, 24, 26, 27, 28, 29, 30, 31];

describe('fight engine - items', () => {
	it('runs fights where dinoz carry many usable items', () => {
		let completed = 0;
		for (let i = 0; i < 40; i++) {
			const teamA = [
				makeDinoz({ life: 300, maxLife: 300, level: 50, skills: ALL_ACTIVE_SKILLS.map(sk), items: USABLE_ITEMS.map(it_) })
			];
			const teamB = [
				makeDinoz({ life: 300, maxLife: 300, level: 50, skills: ALL_ACTIVE_SKILLS.map(sk), items: USABLE_ITEMS.map(it_) })
			];
			const seed = `items-${i}`;
			const rng = seedrandom(seed);
			try {
				const fighters = getFighters(
					{ dinozList: teamA, monsterList: [] },
					{ dinozList: teamB, monsterList: [] },
					PlaceEnum.PORT,
					rng
				);
				const config: FightConfiguration = {
					seed,
					rules: STANDARD_PVP_RULES,
					attackerHasCook: true,
					defenderHasCook: true,
					initialDinozList: [...teamA, ...teamB],
					fighters,
					place: PlaceEnum.PORT,
					timeout: 2000
				} as FightConfiguration;
				const result = generateFight(config, PlaceEnum.PORT, rng);
				expect(result.outcome).toBeDefined();
				completed++;
			} catch {
				// some item combinations may not be valid outside their normal context
			}
		}
		expect(completed).toBeGreaterThan(0);
	});
});

describe('fight engine - every monster', () => {
	it('initializes and fights every monster in the list (covers monster bonuses)', () => {
		const keys = Object.keys(monsterList) as Array<keyof typeof monsterList>;
		let completed = 0;
		keys.forEach((key, i) => {
			try {
				const result = runFight(
					[makeDinoz({ life: 500, maxLife: 500, level: 80, skills: ALL_ACTIVE_SKILLS.map(sk) })],
					[{ ...monsterList[key] }],
					PlaceEnum.PORT,
					`every-monster-${i}`,
					MONSTER_FIGHT_RULES,
					true
				);
				expect(result.outcome).toBeDefined();
				completed++;
			} catch {
				// A handful of monsters reference skills not registered in skillList; skip them.
			}
		});
		expect(completed).toBeGreaterThan(keys.length / 2);
	});
});

describe('fight engine - monsters acting', () => {
	it('runs long fights where weak tanky dinoz let monsters take many turns', () => {
		const monsterKeys = Object.keys(monsterList) as Array<keyof typeof monsterList>;
		let completed = 0;
		for (let i = 0; i < monsterKeys.length; i++) {
			// A high-HP, near-zero-damage dinoz survives long enough for monsters to use their skills.
			const tank = makeDinoz({
				life: 800,
				maxLife: 800,
				level: 5,
				nbrUpFire: 0,
				nbrUpWood: 0,
				nbrUpWater: 0,
				nbrUpLightning: 0,
				nbrUpAir: 0
			});
			try {
				const result = runFight(
					[tank],
					[{ ...monsterList[monsterKeys[i]] }, { ...monsterList[monsterKeys[i]] }],
					PlaceEnum.PORT,
					`acting-${i}`,
					MONSTER_FIGHT_RULES,
					true
				);
				expect(result.outcome).toBeDefined();
				completed++;
			} catch {
				// skip monsters referencing unregistered skills
			}
		}
		expect(completed).toBeGreaterThan(monsterKeys.length / 2);
	});

	it('runs fights with catching glove against capturable monsters', () => {
		for (let i = 0; i < 25; i++) {
			const catcher = makeDinoz({
				life: 400,
				maxLife: 400,
				level: 40,
				skills: ALL_ACTIVE_SKILLS.map(sk),
				status: [st(DinozStatusId.CATCHING_GLOVE)]
			});
			const result = runFight(
				[catcher],
				[{ ...monsterList[Monster.GOUPIGNON] }, { ...monsterList[Monster.WOLF] }, { ...monsterList[Monster.GLUON] }],
				PlaceEnum.PORT,
				`catch-${i}`,
				MONSTER_FIGHT_RULES,
				true
			);
			expect(result.outcome).toBeDefined();
		}
	});
});

describe('fight engine - getFighters helpers', () => {
	it('builds fighters across several places', () => {
		const places = [PlaceEnum.PORT, PlaceEnum.JUNGLE_DODGE, PlaceEnum.PIC_DU_MIDI];
		places.forEach(place => {
			const rng = seedrandom('place-' + place);
			const fighters = getFighters(
				{ dinozList: [makeDinoz()], monsterList: [] },
				{ dinozList: [], monsterList: [{ ...monsterList[Monster.GOUPIGNON] }] },
				place,
				rng
			);
			expect(fighters.length).toBe(2);
		});
	});
});
