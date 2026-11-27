import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	ALL_RACES,
	ArchetypeContext,
	DEMON_RACES,
	FORBIDDEN_SKILL_POOL,
	MetaArchetypeDef,
	NATIVE_RACES,
	REQUIRED_SKILL_POOL,
	SubRoll,
	TeamDinoz,
	TournamentTeamConstraints,
	UP_ELEMENTS,
	UpElement,
	VOTE_CANDIDATES,
	describeRules,
	dominantElements,
	findSubArchetype,
	isDemonDinoz,
	metaArchetypes,
	nextMeta,
	resolveRaceMinimum,
	resolveTeamSize,
	rollCandidates,
	subDescriptionParams,
	validateTeamAgainstRules
} from '@drpg/core/models/dojo/tournamentArchetypes';
import { ruleValidators } from '@drpg/core/models/dojo/tournamentRules';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { SkillTreeType } from '@drpg/core/models/enums/SkillTreeType';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { raceList } from '@drpg/core/models/dinoz/RaceList';

/** Deterministic random generator (mulberry32) */
function seeded(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const emptyCtx = (random = seeded(1)): ArchetypeContext => ({
	lastQualifiedRaces: {},
	recentRegisteredRaces: {},
	lastFeaturedRaces: [],
	lastChampionRaces: [],
	lastFinalistSkills: {},
	racePopulation: {},
	random
});

const fullCtx = (random = seeded(1)): ArchetypeContext => ({
	lastQualifiedRaces: {
		[RaceEnum.SIRAIN]: 40,
		[RaceEnum.WINKS]: 30,
		[RaceEnum.PIGMOU]: 20,
		[RaceEnum.ROCKY]: 10,
		[RaceEnum.KABUKI]: 8,
		[RaceEnum.SMOG]: 2
	},
	recentRegisteredRaces: { [RaceEnum.SIRAIN]: 100, [RaceEnum.WINKS]: 50, [RaceEnum.MOUEFFE]: 3 },
	lastFeaturedRaces: [RaceEnum.SIRAIN, RaceEnum.WINKS, RaceEnum.PIGMOU, RaceEnum.ROCKY],
	lastChampionRaces: [RaceEnum.SIRAIN, RaceEnum.WINKS, RaceEnum.SIRAIN],
	lastFinalistSkills: { [Skill.FORCE]: 20, [Skill.BRAVE]: 12, [Skill.CARAPACE]: 3 },
	racePopulation: { [RaceEnum.SIRAIN]: 1000, [RaceEnum.WINKS]: 10 },
	random
});

let nextId = 1;
const dinoz = (overrides: Partial<TeamDinoz> = {}): TeamDinoz => ({
	id: nextId++,
	level: 20,
	raceId: RaceEnum.SIRAIN,
	nbrUpFire: 10,
	nbrUpWood: 0,
	nbrUpWater: 0,
	nbrUpLightning: 0,
	nbrUpAir: 0,
	skills: [],
	...overrides
});

const constraints = (overrides: Partial<TournamentTeamConstraints> = {}): TournamentTeamConstraints => ({
	teamSize: 3,
	raceMinimum: 1,
	teamRace: [...ALL_RACES],
	levelLimit: 50,
	rules: {},
	...overrides
});

const ups = (element: UpElement, count: number): Partial<TeamDinoz> => ({
	nbrUpFire: element === ElementType.FIRE ? count : 0,
	nbrUpWood: element === ElementType.WOOD ? count : 0,
	nbrUpWater: element === ElementType.WATER ? count : 0,
	nbrUpLightning: element === ElementType.LIGHTNING ? count : 0,
	nbrUpAir: element === ElementType.AIR ? count : 0
});

const demonSkillOf = (race: RaceEnum) => raceList[race].demon!.skills[0];
const etherSkills = Object.values(skillList)
	.filter(s => s.tree === SkillTreeType.ETHER)
	.map(s => s.id);
const invocation = Object.values(skillList).find(s => s.type === SkillType.I)!.id;

describe('nextMeta', () => {
	it('follows the rotation races → restrictive → ffa → echo → races', () => {
		expect(nextMeta('races').key).toBe('restrictive');
		expect(nextMeta('restrictive').key).toBe('ffa');
		expect(nextMeta('ffa').key).toBe('echo');
		expect(nextMeta('echo').key).toBe('races');
	});

	it('starts with the first active meta when previous is null or unknown', () => {
		expect(nextMeta(null).key).toBe('races');
		expect(nextMeta('removed_meta').key).toBe('races');
	});

	it('skips disabled metas and restarts when previous is disabled', () => {
		const catalogue: MetaArchetypeDef[] = metaArchetypes.map(m => ({ ...m, enabled: m.key !== 'restrictive' }));
		expect(nextMeta('races', catalogue).key).toBe('ffa');
		expect(nextMeta('restrictive', catalogue).key).toBe('races');
		expect(nextMeta('echo', catalogue).key).toBe('races');
	});

	it('sorts by order, not by position in the catalogue', () => {
		const catalogue = [...metaArchetypes].reverse();
		expect(nextMeta('races', catalogue).key).toBe('restrictive');
	});

	it('throws when no meta is active', () => {
		const catalogue = metaArchetypes.map(m => ({ ...m, enabled: false }));
		expect(() => nextMeta(null, catalogue)).toThrow();
	});
});

describe('rollCandidates', () => {
	it('rolls VOTE_CANDIDATES distinct subs of the meta', () => {
		for (let seed = 1; seed <= 50; seed++) {
			const candidates = rollCandidates('races', fullCtx(seeded(seed)));
			expect(candidates).toHaveLength(VOTE_CANDIDATES);
			expect(new Set(candidates.map(c => c.key)).size).toBe(VOTE_CANDIDATES);
			expect(candidates.every(c => c.meta === 'races')).toBe(true);
		}
	});

	it('never rolls a disabled sub', () => {
		const disabled = ['summoners', 'no_summon', 'ether_adepts'];
		for (let seed = 1; seed <= 200; seed++) {
			const candidates = rollCandidates('restrictive', emptyCtx(seeded(seed)));
			expect(candidates.some(c => disabled.includes(c.key))).toBe(false);
		}
	});

	it('is deterministic with the same random', () => {
		expect(rollCandidates('restrictive', fullCtx(seeded(42)))).toEqual(
			rollCandidates('restrictive', fullCtx(seeded(42)))
		);
	});

	it('only proposes the echo subs having history', () => {
		const ctx = { ...emptyCtx(), lastChampionRaces: [RaceEnum.SIRAIN] };
		const candidates = rollCandidates('echo', ctx);
		expect(candidates.map(c => c.key).sort()).toEqual(['champion_ban', 'heritage']);
	});

	it('falls back to the next meta when echo has no history', () => {
		const candidates = rollCandidates('echo', emptyCtx());
		expect(candidates).toHaveLength(VOTE_CANDIDATES);
		expect(candidates.every(c => c.meta === 'races')).toBe(true);
	});

	it('rolls echo subs when the history exists', () => {
		const candidates = rollCandidates('echo', fullCtx());
		expect(candidates).toHaveLength(VOTE_CANDIDATES);
		expect(candidates.every(c => c.meta === 'echo')).toBe(true);
	});

	it('starts from the first active meta when the meta is unknown', () => {
		expect(rollCandidates('removed_meta', fullCtx()).every(c => c.meta === 'races')).toBe(true);
	});

	it('never picks a sub with a null weight', () => {
		const catalogue: MetaArchetypeDef[] = [
			{
				...metaArchetypes[0],
				subs: metaArchetypes[0].subs.map(s => (s.key === 'monorace' ? s : { ...s, weight: 0 }))
			}
		];
		const candidates = rollCandidates('races', fullCtx(), catalogue);
		expect(candidates.map(c => c.key)).toEqual(['monorace']);
	});

	it('returns [] after a full turn without any available sub', () => {
		const catalogue: MetaArchetypeDef[] = metaArchetypes.map(m => ({
			...m,
			subs: m.subs.map(s => ({ ...s, isAvailable: () => false }))
		}));
		expect(rollCandidates('races', fullCtx(), catalogue)).toEqual([]);
	});
});

describe('sub rolls', () => {
	const roll = (key: string, ctx: ArchetypeContext = fullCtx()) => findSubArchetype(key)!.sub.roll(ctx);

	it('monorace picks a race weighted by population', () => {
		const counts: Record<number, number> = {};
		for (let seed = 1; seed <= 100; seed++) {
			const r = roll('monorace', fullCtx(seeded(seed)));
			expect(r.teamRace).toHaveLength(1);
			expect(r.raceMinimum).toBe(1);
			counts[r.teamRace[0]] = (counts[r.teamRace[0]] ?? 0) + 1;
		}
		expect(counts[RaceEnum.SIRAIN]).toBeGreaterThan(90);
		// Without population, any race
		expect(ALL_RACES).toContain(roll('monorace', emptyCtx()).teamRace[0]);
	});

	it('duo_race and trio_race draw distinct races', () => {
		const duo = roll('duo_race');
		expect(new Set(duo.teamRace).size).toBe(2);
		expect(duo.raceMinimum).toBe(2);
		const trio = roll('trio_race');
		expect(new Set(trio.teamRace).size).toBe(3);
		expect(trio.raceMinimum).toBe(3);
	});

	it('race draws only use the available races', () => {
		const available = [RaceEnum.SIRAIN, RaceEnum.WINKS];
		for (let seed = 1; seed <= 20; seed++) {
			const ctx = { ...fullCtx(seeded(seed)), availableRaces: available };
			expect(available).toContain(roll('monorace', ctx).teamRace[0]);
			expect([...roll('duo_race', ctx).teamRace].sort()).toEqual([...available].sort());
			for (const race of roll('outsiders', ctx).teamRace) expect(available).toContain(race);
		}
		const sub = (key: string) => findSubArchetype(key)!.sub;
		const two = { ...fullCtx(), availableRaces: available };
		expect(sub('trio_race').isAvailable?.(two)).toBe(false);
		expect(sub('duo_race').isAvailable?.(two)).toBe(true);
		const none = { ...fullCtx(), availableRaces: [] };
		for (const key of ['monorace', 'duo_race', 'trio_race', 'outsiders'])
			expect(sub(key).isAvailable?.(none)).toBe(false);
		// Fixed race lists are not filtered
		expect(roll('flying', two).teamRace.length).toBeGreaterThan(2);
	});

	it('follow_the_demon: one demon captain, the others of its race and not demons', () => {
		const r = roll('follow_the_demon');
		expect(r.teamRace).toEqual(DEMON_RACES);
		const t = constraints({ teamRace: r.teamRace, rules: r.rules });
		const demon = (raceId: RaceEnum) => dinoz({ raceId, skills: [{ skillId: demonSkillOf(raceId) }] });
		const pigmou = () => dinoz({ raceId: RaceEnum.PIGMOU });
		expect(validateTeamAgainstRules([demon(RaceEnum.PIGMOU), pigmou(), pigmou()], t)).toBeNull();
		expect(validateTeamAgainstRules([demon(RaceEnum.PIGMOU), demon(RaceEnum.PIGMOU), pigmou()], t)?.key).toBe(
			'demonExactlyOne'
		);
		expect(validateTeamAgainstRules([pigmou(), pigmou(), pigmou()], t)?.key).toBe('demonExactlyOne');
		const other = DEMON_RACES.find(race => race !== RaceEnum.PIGMOU)!;
		expect(validateTeamAgainstRules([demon(RaceEnum.PIGMOU), pigmou(), dinoz({ raceId: other })], t)?.key).toBe(
			'sameRace'
		);
	});

	it('terrestrial is the complement of flying', () => {
		const flying = roll('flying').teamRace;
		const terrestrial = roll('terrestrial').teamRace;
		expect([...flying, ...terrestrial].sort()).toEqual([...ALL_RACES].sort());
		expect(flying.some(r => terrestrial.includes(r))).toBe(false);
	});

	it('element_native uses the native races of the drawn element', () => {
		const r = roll('element_native');
		const element = r.params!.element as UpElement;
		expect(r.teamRace).toEqual(NATIVE_RACES[element]);
	});

	it('demons only allows the races having a demon variant', () => {
		expect(roll('demons').teamRace).toEqual(DEMON_RACES);
		expect(DEMON_RACES.length).toBeGreaterThan(0);
	});

	it('element_min draws a minimum between 5 and 15', () => {
		for (let seed = 1; seed <= 50; seed++) {
			const { min } = roll('element_min', fullCtx(seeded(seed))).rules.elementMin!;
			expect(min).toBeGreaterThanOrEqual(5);
			expect(min).toBeLessThanOrEqual(15);
		}
	});

	it('skill subs draw from their pools', () => {
		expect(REQUIRED_SKILL_POOL).toContain(roll('skill_required').rules.skillRequired);
		expect(FORBIDDEN_SKILL_POOL).toContain(roll('skill_forbidden').rules.skillForbidden);
	});

	it('skill pools hold base tree skills, not sphere skills, without race restriction', () => {
		for (const skill of [...REQUIRED_SKILL_POOL, ...FORBIDDEN_SKILL_POOL]) {
			expect(skillList[skill].tree).toBe(SkillTreeType.VANILLA);
			expect(skillList[skill].isSphereSkill).toBe(false);
			expect(skillList[skill].raceId).toBeUndefined();
		}
	});

	it('ffa subs impose their team size', () => {
		expect(roll('ffa_solo').teamSize).toBe(1);
		expect(roll('ffa_duo').teamSize).toBe(2);
		expect(roll('ffa_trio').teamSize).toBe(3);
		expect(roll('ffa_squad').teamSize).toBe(5);
		expect(roll('ffa_legion').teamSize).toBe(6);
		expect(roll('ffa_open').teamSize).toBeUndefined();
		expect(roll('ffa_open').teamRace).toEqual(ALL_RACES);
	});

	it('anti_meta forbids the 5 most qualified races', () => {
		const r = roll('anti_meta');
		const forbidden = [RaceEnum.SIRAIN, RaceEnum.WINKS, RaceEnum.PIGMOU, RaceEnum.ROCKY, RaceEnum.KABUKI];
		expect(r.rules.forbiddenRaces!.sort()).toEqual(forbidden.sort());
		expect(r.teamRace).toHaveLength(ALL_RACES.length - 5);
		expect(r.teamRace.some(x => forbidden.includes(x))).toBe(false);
	});

	it('outsiders only allows the 8 least registered races (absent races count as 0)', () => {
		const r = roll('outsiders');
		expect(r.teamRace).toHaveLength(8);
		expect(r.teamRace).not.toContain(RaceEnum.SIRAIN);
		expect(r.teamRace).not.toContain(RaceEnum.WINKS);
		expect(r.teamRace).not.toContain(RaceEnum.MOUEFFE);
	});

	it('vedettes, champion_ban, heritage and skill_echo use the history', () => {
		expect(roll('vedettes').teamRace).toEqual([RaceEnum.SIRAIN, RaceEnum.WINKS, RaceEnum.PIGMOU, RaceEnum.ROCKY]);
		const ban = roll('champion_ban');
		expect(ban.rules.forbiddenRaces).toEqual([RaceEnum.SIRAIN, RaceEnum.WINKS]);
		expect(ban.teamRace).not.toContain(RaceEnum.SIRAIN);
		expect(roll('heritage').rules.requireOneOf).toEqual([RaceEnum.SIRAIN, RaceEnum.WINKS]);
		// Force is the most widespread but is a base skill: only the curated pool can be forbidden
		expect(roll('skill_echo').rules.skillForbidden).toBe(Skill.BRAVE);
	});

	it('echo subs are unavailable without history', () => {
		const echo = metaArchetypes.find(m => m.key === 'echo')!;
		for (const sub of echo.subs) {
			expect(sub.isAvailable?.(emptyCtx())).toBe(false);
			expect(sub.isAvailable?.(fullCtx())).toBe(true);
		}
	});

	it('subDescriptionParams exposes the rolled parameters', () => {
		const r = roll('element_min');
		expect(subDescriptionParams(r)).toMatchObject({
			races: ALL_RACES,
			element: r.rules.elementMin!.element,
			min: r.rules.elementMin!.min
		});
		expect(subDescriptionParams(roll('champion_ban')).forbidden).toEqual([RaceEnum.SIRAIN, RaceEnum.WINKS]);
		expect(subDescriptionParams(roll('element_native')).element).toBeDefined();
	});
});

/** Build a team satisfying the roll, to check that every sub produces rules a team can meet */
function buildTeamFor(roll: SubRoll, random: () => number): { team: TeamDinoz[]; t: TournamentTeamConstraints } {
	const teamSize = resolveTeamSize(roll, random);
	const raceMinimum = resolveRaceMinimum(roll, teamSize, random);
	const rules = roll.rules;
	const allowed = [...new Set(roll.teamRace)].filter(r => !(rules.forbiddenRaces ?? []).includes(r));
	// Preferred first race: a required one, or a demon race for the demon captain
	const first =
		rules.requireOneOf?.find(r => allowed.includes(r)) ?? (rules.demon === 'exactlyOne' ? DEMON_RACES[0] : allowed[0]);
	const ordered = [first, ...allowed.filter(r => r !== first)];
	const races: RaceEnum[] = [];
	for (let i = 0; i < teamSize; i++) {
		if (rules.sameRace) races.push(ordered[0]);
		else if (rules.pairs) races.push(ordered[Math.floor(i / 2)]);
		else races.push(ordered[i % ordered.length]);
	}
	const team = races.map((raceId, i) => {
		let element: UpElement = ElementType.FIRE;
		if (rules.rainbow) element = UP_ELEMENTS[i];
		if (rules.elementDominant) element = rules.elementDominant;
		if (rules.elementMin) element = rules.elementMin.element;
		const elementUps = rules.balancedPct
			? { nbrUpFire: 3, nbrUpWood: 3, nbrUpWater: 3, nbrUpLightning: 3, nbrUpAir: 3 }
			: ups(element, 15);
		const skills: { skillId: number }[] = [];
		if (rules.skillRequired) skills.push({ skillId: rules.skillRequired });
		if (rules.summon === 'required') skills.push({ skillId: invocation });
		if (rules.etherMin) etherSkills.slice(0, rules.etherMin).forEach(s => skills.push({ skillId: s }));
		const demon = rules.demon === 'only' || (rules.demon === 'exactlyOne' && i === 0);
		if (demon) skills.push({ skillId: demonSkillOf(raceId) });
		return dinoz({ raceId, level: 20, ...elementUps, skills });
	});
	return { team, t: { teamSize, raceMinimum, teamRace: roll.teamRace, levelLimit: 50, rules } };
}

describe('every sub produces rules a team can meet', () => {
	for (const meta of metaArchetypes) {
		for (const sub of meta.subs) {
			it(`${meta.key}/${sub.key}`, () => {
				for (let seed = 1; seed <= 20; seed++) {
					const random = seeded(seed);
					const roll = sub.roll(fullCtx(random));
					expect(roll.meta).toBe(meta.key);
					expect(roll.key).toBe(sub.key);
					expect(roll.teamRace.length).toBeGreaterThan(0);
					expect(roll.teamRace.every(r => ALL_RACES.includes(r))).toBe(true);
					const { team, t } = buildTeamFor(roll, random);
					expect(validateTeamAgainstRules(team, t)).toBeNull();
					// A team of the wrong size is refused
					expect(validateTeamAgainstRules(team.slice(1), t)?.key).toBe('teamSize');
				}
			});
		}
	}
});

describe('resolveTeamSize / resolveRaceMinimum', () => {
	const base: SubRoll = { meta: 'races', key: 'test', teamRace: [...ALL_RACES], rules: {} };

	it('uses the imposed team size, else the allowed sizes, else 3 to 6', () => {
		expect(resolveTeamSize({ ...base, teamSize: 1 })).toBe(1);
		expect(resolveTeamSize({ ...base, teamSizes: [4, 6] }, () => 0)).toBe(4);
		expect(resolveTeamSize({ ...base, teamSizes: [4, 6] }, () => 0.99)).toBe(6);
		expect(resolveTeamSize(base, () => 0)).toBe(3);
		expect(resolveTeamSize(base, () => 0.999)).toBe(6);
	});

	it('uses the imposed race minimum, capped by the team size and the races', () => {
		expect(resolveRaceMinimum({ ...base, raceMinimum: 1 }, 5)).toBe(1);
		expect(resolveRaceMinimum({ ...base, raceMinimum: 3 }, 2)).toBe(2);
		expect(resolveRaceMinimum({ ...base, teamRace: [RaceEnum.SIRAIN], raceMinimum: 3 }, 5)).toBe(1);
	});

	it('derives the race minimum from the rules', () => {
		expect(resolveRaceMinimum({ ...base, rules: { sameRace: true } }, 5, () => 0.99)).toBe(1);
		expect(resolveRaceMinimum({ ...base, rules: { pairs: true } }, 6, () => 0)).toBe(3);
		expect(resolveRaceMinimum({ ...base, rules: { distinctRaces: true } }, 5, () => 0)).toBe(5);
	});

	it('draws between 2 and the cap otherwise', () => {
		expect(resolveRaceMinimum(base, 5, () => 0)).toBe(2);
		expect(resolveRaceMinimum(base, 5, () => 0.999)).toBe(5);
		const twoRaces = { ...base, teamRace: [RaceEnum.SIRAIN, RaceEnum.WINKS] };
		expect(resolveRaceMinimum(twoRaces, 5, () => 0.999)).toBe(2);
		// Forbidden races are not counted
		expect(resolveRaceMinimum({ ...twoRaces, rules: { forbiddenRaces: [RaceEnum.WINKS] } }, 5, () => 0.999)).toBe(1);
	});
});

describe('dominantElements / isDemonDinoz', () => {
	it('returns every element sharing the maximum, none without level up', () => {
		expect(dominantElements(dinoz({ nbrUpFire: 5, nbrUpWater: 5, nbrUpAir: 2 }))).toEqual([
			ElementType.FIRE,
			ElementType.WATER
		]);
		expect(dominantElements(dinoz({ ...ups(ElementType.AIR, 3) }))).toEqual([ElementType.AIR]);
		expect(dominantElements(dinoz({ nbrUpFire: 0 }))).toEqual([]);
	});

	it('detects a demon by its status when provided, else by its demon skills', () => {
		const skill = demonSkillOf(RaceEnum.PIGMOU);
		expect(isDemonDinoz(dinoz({ raceId: RaceEnum.PIGMOU, skills: [{ skillId: skill }] }))).toBe(true);
		expect(isDemonDinoz(dinoz({ raceId: RaceEnum.PIGMOU }))).toBe(false);
		expect(isDemonDinoz(dinoz({ status: [{ statusId: DinozStatusId.DEMON }] }))).toBe(true);
		expect(isDemonDinoz(dinoz({ raceId: RaceEnum.PIGMOU, skills: [{ skillId: skill }], status: [] }))).toBe(false);
	});
});

const errorKeys = new Set<string>();
const check = (team: TeamDinoz[], t: TournamentTeamConstraints) => {
	const error = validateTeamAgainstRules(team, t);
	if (error) errorKeys.add(error.key);
	return error;
};
const three = (overrides: Partial<TeamDinoz> = {}) => [dinoz(overrides), dinoz(overrides), dinoz(overrides)];

describe('validateTeamAgainstRules', () => {
	it('accepts a valid team without rules', () => {
		expect(check(three(), constraints())).toBeNull();
	});

	it('checks the team size', () => {
		expect(check(three().slice(1), constraints())).toEqual({ key: 'teamSize', params: { qty: 3 } });
	});

	it('checks the authorized races', () => {
		const team = [dinoz(), dinoz(), dinoz({ raceId: RaceEnum.WINKS })];
		expect(check(team, constraints({ teamRace: [RaceEnum.SIRAIN] }))).toEqual({
			key: 'wrongRace',
			params: { race: RaceEnum.WINKS }
		});
	});

	it('checks the level limit', () => {
		expect(check([dinoz(), dinoz(), dinoz({ level: 51 })], constraints())).toEqual({
			key: 'levelTooHigh',
			params: { max: 50 }
		});
		expect(check([dinoz(), dinoz(), dinoz({ level: 50 })], constraints())).toBeNull();
	});

	it('checks the race minimum (a demon counts as its race)', () => {
		const t = constraints({ raceMinimum: 2 });
		expect(check(three(), t)).toEqual({ key: 'notEnoughRaces', params: { qty: 2 } });
		const pigmou = dinoz({ raceId: RaceEnum.PIGMOU });
		const demonPigmou = dinoz({ raceId: RaceEnum.PIGMOU, skills: [{ skillId: demonSkillOf(RaceEnum.PIGMOU) }] });
		expect(check([pigmou, demonPigmou, dinoz({ raceId: RaceEnum.PIGMOU })], t)?.key).toBe('notEnoughRaces');
		expect(check([pigmou, demonPigmou, dinoz()], t)).toBeNull();
	});

	it('forbiddenRaces', () => {
		const t = constraints({ rules: { forbiddenRaces: [RaceEnum.WINKS] } });
		expect(check(three(), t)).toBeNull();
		expect(check([dinoz(), dinoz(), dinoz({ raceId: RaceEnum.WINKS })], t)).toEqual({
			key: 'forbiddenRace',
			params: { race: RaceEnum.WINKS }
		});
	});

	it('demon', () => {
		const demon = () => dinoz({ raceId: RaceEnum.PIGMOU, skills: [{ skillId: demonSkillOf(RaceEnum.PIGMOU) }] });
		const only = constraints({ rules: { demon: 'only' } });
		expect(check([demon(), demon(), demon()], only)).toBeNull();
		expect(check([demon(), demon(), dinoz()], only)?.key).toBe('demonOnly');
		const none = constraints({ rules: { demon: 'none' } });
		expect(check(three(), none)).toBeNull();
		expect(check([demon(), dinoz(), dinoz()], none)?.key).toBe('demonNone');
		const one = constraints({ rules: { demon: 'exactlyOne' } });
		expect(check([demon(), dinoz(), dinoz()], one)).toBeNull();
		expect(check(three(), one)?.key).toBe('demonExactlyOne');
		expect(check([demon(), demon(), dinoz()], one)?.key).toBe('demonExactlyOne');
	});

	it('sameRace', () => {
		const t = constraints({ rules: { sameRace: true } });
		expect(check(three(), t)).toBeNull();
		expect(check([dinoz(), dinoz(), dinoz({ raceId: RaceEnum.WINKS })], t)?.key).toBe('sameRace');
	});

	it('pairs', () => {
		const t = constraints({ teamSize: 4, rules: { pairs: true } });
		const w = () => dinoz({ raceId: RaceEnum.WINKS });
		expect(check([dinoz(), dinoz(), w(), w()], t)).toBeNull();
		expect(check([dinoz(), dinoz(), dinoz(), w()], t)?.key).toBe('pairs');
	});

	it('distinctRaces', () => {
		const t = constraints({ rules: { distinctRaces: true } });
		const distinct = [dinoz(), dinoz({ raceId: RaceEnum.WINKS }), dinoz({ raceId: RaceEnum.PIGMOU })];
		expect(check(distinct, t)).toBeNull();
		expect(check([dinoz(), dinoz(), dinoz({ raceId: RaceEnum.WINKS })], t)?.key).toBe('distinctRaces');
	});

	it('requireOneOf', () => {
		const t = constraints({ rules: { requireOneOf: [RaceEnum.WINKS, RaceEnum.PIGMOU] } });
		expect(check([dinoz(), dinoz(), dinoz({ raceId: RaceEnum.PIGMOU })], t)).toBeNull();
		expect(check(three(), t)).toEqual({
			key: 'requireOneOf',
			params: { races: [RaceEnum.WINKS, RaceEnum.PIGMOU] }
		});
	});

	it('elementMin', () => {
		const t = constraints({ rules: { elementMin: { element: ElementType.WATER, min: 8 } } });
		expect(check(three(ups(ElementType.WATER, 8)), t)).toBeNull();
		expect(
			check([dinoz(ups(ElementType.WATER, 8)), dinoz(ups(ElementType.WATER, 8)), dinoz(ups(ElementType.WATER, 7))], t)
		).toEqual({
			key: 'elementMin',
			params: { element: ElementType.WATER, min: 8 }
		});
	});

	it('elementDominant (a tie with the element is accepted)', () => {
		const t = constraints({ rules: { elementDominant: ElementType.AIR } });
		expect(
			check([dinoz(ups(ElementType.AIR, 5)), dinoz({ nbrUpFire: 4, nbrUpAir: 4 }), dinoz(ups(ElementType.AIR, 1))], t)
		).toBeNull();
		expect(
			check([dinoz(ups(ElementType.AIR, 5)), dinoz(ups(ElementType.AIR, 5)), dinoz({ nbrUpFire: 5, nbrUpAir: 4 })], t)
				?.key
		).toBe('elementDominant');
	});

	it('elementPurity', () => {
		const t = constraints({ rules: { elementPurity: true } });
		expect(check([dinoz(), dinoz({ nbrUpFire: 3, nbrUpWood: 3 }), dinoz()], t)).toBeNull();
		expect(check([dinoz(), dinoz(), dinoz(ups(ElementType.WOOD, 4))], t)?.key).toBe('elementPurity');
	});

	it('rainbow (ties can be assigned to different elements)', () => {
		const t = constraints({ rules: { rainbow: true } });
		const fire = dinoz(ups(ElementType.FIRE, 5));
		const fireOrWater = dinoz({ nbrUpFire: 5, nbrUpWater: 5 });
		const water = dinoz(ups(ElementType.WATER, 5));
		const air = dinoz(ups(ElementType.AIR, 5));
		expect(check([fire, fireOrWater, air], t)).toBeNull();
		expect(check([fire, fireOrWater, water], t)?.key).toBe('rainbow');
		expect(check([fire, dinoz(), air], t)?.key).toBe('rainbow');
	});

	it('specialistPct', () => {
		const t = constraints({ rules: { specialistPct: 50 } });
		expect(check(three({ nbrUpFire: 5, nbrUpWood: 5 }), t)).toBeNull();
		expect(check([dinoz(), dinoz(), dinoz({ nbrUpFire: 4, nbrUpWood: 3, nbrUpAir: 2 })], t)).toEqual({
			key: 'specialist',
			params: { pct: 50 }
		});
		expect(check([dinoz(), dinoz(), dinoz({ nbrUpFire: 0 })], t)?.key).toBe('specialist');
	});

	it('balancedPct', () => {
		const t = constraints({ rules: { balancedPct: 35 } });
		const balanced = { nbrUpFire: 3, nbrUpWood: 3, nbrUpWater: 2, nbrUpLightning: 1, nbrUpAir: 1 };
		expect(check(three(balanced), t)).toBeNull();
		expect(check([dinoz(balanced), dinoz(balanced), dinoz({ ...balanced, nbrUpFire: 4 })], t)).toEqual({
			key: 'balanced',
			params: { pct: 35 }
		});
	});

	it('skillRequired / skillForbidden', () => {
		const required = constraints({ rules: { skillRequired: Skill.FORCE } });
		expect(check(three({ skills: [{ skillId: Skill.FORCE }] }), required)).toBeNull();
		expect(check([dinoz({ skills: [{ skillId: Skill.FORCE }] }), dinoz(), dinoz()], required)).toEqual({
			key: 'skillRequired',
			params: { skill: Skill.FORCE }
		});
		const forbidden = constraints({ rules: { skillForbidden: Skill.BRAVE } });
		expect(check(three({ skills: [{ skillId: Skill.FORCE }] }), forbidden)).toBeNull();
		expect(check([dinoz({ skills: [{ skillId: Skill.BRAVE }] }), dinoz(), dinoz()], forbidden)).toEqual({
			key: 'skillForbidden',
			params: { skill: Skill.BRAVE }
		});
	});

	it('summon', () => {
		const summoner = () => dinoz({ skills: [{ skillId: invocation }] });
		const required = constraints({ rules: { summon: 'required' } });
		expect(check([summoner(), summoner(), summoner()], required)).toBeNull();
		expect(check([summoner(), summoner(), dinoz()], required)?.key).toBe('summonRequired');
		const none = constraints({ rules: { summon: 'none' } });
		expect(check(three(), none)).toBeNull();
		expect(check([summoner(), dinoz(), dinoz()], none)?.key).toBe('summonNone');
	});

	it('purist', () => {
		const t = constraints({ rules: { purist: true } });
		expect(check(three({ skills: [{ skillId: Skill.FORCE }] }), t)).toBeNull();
		expect(check([dinoz({ skills: [{ skillId: etherSkills[0] }] }), dinoz(), dinoz()], t)?.key).toBe('purist');
		expect(check([dinoz({ skills: [{ skillId: Skill.COEUR_DU_PHOENIX }] }), dinoz(), dinoz()], t)?.key).toBe('purist');
	});

	it('etherMin', () => {
		const t = constraints({ rules: { etherMin: 2 } });
		const adept = () => dinoz({ skills: etherSkills.slice(0, 2).map(skillId => ({ skillId })) });
		expect(check([adept(), adept(), adept()], t)).toBeNull();
		expect(check([adept(), adept(), dinoz({ skills: [{ skillId: etherSkills[0] }] })], t)).toEqual({
			key: 'etherMin',
			params: { min: 2 }
		});
	});

	it('levelBudgetPct', () => {
		// 80% of 50 × 3 = 120
		const t = constraints({ rules: { levelBudgetPct: 80 } });
		expect(check(three({ level: 40 }), t)).toBeNull();
		expect(check([dinoz({ level: 40 }), dinoz({ level: 40 }), dinoz({ level: 41 })], t)).toEqual({
			key: 'levelBudget',
			params: { max: 120, sum: 121 }
		});
	});

	it('levelSpread', () => {
		const t = constraints({ rules: { levelSpread: 5 } });
		expect(check([dinoz({ level: 20 }), dinoz({ level: 25 }), dinoz({ level: 22 })], t)).toBeNull();
		expect(check([dinoz({ level: 20 }), dinoz({ level: 26 }), dinoz({ level: 22 })], t)).toEqual({
			key: 'levelSpread',
			params: { max: 5 }
		});
	});

	it('ignores false and empty rules', () => {
		const rules = { sameRace: false, forbiddenRaces: [], requireOneOf: [] };
		expect(check([dinoz(), dinoz({ raceId: RaceEnum.WINKS }), dinoz()], constraints({ rules }))).toBeNull();
	});

	it('every rule has a validator covered above', () => {
		expect(Object.keys(ruleValidators).sort()).toEqual(
			[
				'forbiddenRaces',
				'demon',
				'sameRace',
				'pairs',
				'distinctRaces',
				'requireOneOf',
				'elementMin',
				'elementDominant',
				'elementPurity',
				'rainbow',
				'specialistPct',
				'balancedPct',
				'skillRequired',
				'skillForbidden',
				'summon',
				'purist',
				'etherMin',
				'levelBudgetPct',
				'levelSpread'
			].sort()
		);
	});
});

describe('describeRules', () => {
	it('lists the active rules with their params', () => {
		expect(describeRules(null)).toEqual([]);
		expect(
			describeRules({ demon: 'exactlyOne', skillForbidden: Skill.BRAVE, forbiddenRaces: [], sameRace: false })
		).toEqual([
			{ key: 'demon_exactlyOne', params: { value: 'exactlyOne' } },
			{ key: 'skillForbidden', params: { skill: Skill.BRAVE } }
		]);
		expect(describeRules({ levelSpread: 5, forbiddenRaces: [RaceEnum.SIRAIN] })).toEqual([
			{ key: 'forbiddenRaces', params: { races: [RaceEnum.SIRAIN], count: 1 } },
			{ key: 'levelSpread', params: { value: 5 } }
		]);
	});
});

describe('i18n', () => {
	const locales = ['fr', 'en', 'es', 'de'];
	const files = [
		...locales.map(l => `../../../i18n/${l}.json`),
		...locales.map(l => `../../../../ed-ui/src/i18n/locales/${l}.json`)
	].map(path => ({
		path,
		json: JSON.parse(readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8'))
	}));
	const get = (json: unknown, key: string) =>
		key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], json);
	const expectKey = (key: string) => {
		for (const { path, json } of files) {
			expect(typeof get(json, key), `${key} in ${path}`).toBe('string');
		}
	};

	it('every meta and sub has a name and a description in the 4 languages, front and back', () => {
		for (const meta of metaArchetypes) {
			expectKey(`tournament.archetype.meta.${meta.key}.name`);
			expectKey(`tournament.archetype.meta.${meta.key}.description`);
			for (const sub of meta.subs) {
				expectKey(`tournament.archetype.sub.${sub.key}.name`);
				expectKey(`tournament.archetype.sub.${sub.key}.description`);
			}
		}
	});

	it('every rule has a description', () => {
		const rules = describeRules({
			forbiddenRaces: [RaceEnum.SIRAIN],
			sameRace: true,
			pairs: true,
			distinctRaces: true,
			requireOneOf: [RaceEnum.SIRAIN],
			elementMin: { element: ElementType.FIRE, min: 5 },
			elementDominant: ElementType.FIRE,
			elementPurity: true,
			rainbow: true,
			specialistPct: 50,
			balancedPct: 35,
			skillRequired: Skill.FORCE,
			skillForbidden: Skill.BRAVE,
			purist: true,
			etherMin: 2,
			levelBudgetPct: 80,
			levelSpread: 5
		});
		const keys = [
			...rules.map(r => r.key),
			'demon_only',
			'demon_none',
			'demon_exactlyOne',
			'summon_required',
			'summon_none'
		];
		for (const key of keys) expectKey(`tournament.archetype.rule.${key}`);
	});

	it('every error returned by the validation is translated', () => {
		expect(errorKeys.size).toBeGreaterThan(20);
		for (const key of errorKeys) expectKey(`tournament.archetype.error.${key}`);
	});

	it('every element and every skill of the pools is translated', () => {
		for (const element of ['fire', 'wood', 'water', 'lightning', 'air']) {
			expectKey(`tournament.archetype.element.${element}`);
		}
		for (const skill of [...REQUIRED_SKILL_POOL, ...FORBIDDEN_SKILL_POOL]) {
			expectKey(`tournament.archetype.skill.${skill}`);
		}
	});
});
