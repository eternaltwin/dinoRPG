import { ElementType } from '../enums/ElementType.mjs';
import { RaceEnum } from '../enums/RaceEnum.mjs';
import { Skill } from '../dinoz/SkillList.mjs';
import { formatName, formatTID } from './teamFormat.mjs';
import { ALL_RACES, DEMON_RACES, UP_ELEMENTS, validateTeam } from './tournamentRules.mjs';

/**
 * Tournament archetypes.
 *
 * Each tournament belongs to a meta archetype (races, restrictive, ffa, echo) that rotates from one tournament to the
 * next. A meta archetype holds several sub archetypes: at the end of the qualification of a tournament, 3 sub
 * archetypes of the next meta are rolled and submitted to a vote, the winner is drawn at random weighted by votes + 1
 * when the next tournament is created.
 *
 * The catalogue is declarative: a meta or a sub is added/removed by editing the catalogue (and its i18n keys), a
 * disabled one is kept with `enabled: false`. Tournaments store keys and resolved rules, never an index.
 */

/** Keys of the meta archetypes. Kept as plain strings so a meta can be added/removed without migration. */
export type MetaArchetypeKey = 'races' | 'restrictive' | 'ffa' | 'echo' | (string & {});

/** Elements a dinoz can level up (void excluded). */
export type UpElement =
	| ElementType.FIRE
	| ElementType.WOOD
	| ElementType.WATER
	| ElementType.LIGHTNING
	| ElementType.AIR;

/**
 * Resolved rules of a sub archetype, stored in Tournament.rules. Every field is optional: a rule absent is not checked.
 * Rules are independent from subs: a new sub can combine existing rules without new validation code.
 */
export type TournamentRules = {
	/** Demon dinoz: only demons, no demon, or exactly one demon in the team */
	demon?: 'only' | 'none' | 'exactlyOne';
	/** The whole team is of a single race (chosen by the player) */
	sameRace?: boolean;
	/** The team is made of pairs of the same race (A A B B ...) */
	pairs?: boolean;
	/** Every dinoz has at least `min` level ups in `element` */
	elementMin?: { element: UpElement; min: number };
	/** The most levelled element of every dinoz is this one */
	elementDominant?: UpElement;
	/** Every dinoz shares the same dominant element (chosen by the player) */
	elementPurity?: boolean;
	/** Every dinoz has a different dominant element */
	rainbow?: boolean;
	/** Every dinoz has at least this % of its level ups in a single element */
	specialistPct?: number;
	/** No dinoz has more than this % of its level ups in a single element */
	balancedPct?: number;
	/** Every dinoz has this skill */
	skillRequired?: Skill;
	/** No dinoz has this skill */
	skillForbidden?: Skill;
	/** Every dinoz has at least one invocation / no invocation at all */
	summon?: 'required' | 'none';
	/** No skill of the Ether tree nor sphere skill */
	purist?: boolean;
	/** Every dinoz has at least this number of Ether skills */
	etherMin?: number;
	/** Every dinoz of the team is of a different race */
	distinctRaces?: boolean;
	/** Sum of the levels ≤ this % of (levelLimit × teamSize) */
	levelBudgetPct?: number;
	/** Max level difference between the highest and the lowest dinoz of the team */
	levelSpread?: number;
	/** At least one dinoz of one of these races */
	requireOneOf?: RaceEnum[];
	/** These races are forbidden (used by echo subs, on top of teamRace) */
	forbiddenRaces?: RaceEnum[];
};

/** Result of rolling a sub archetype, before the common parameters (poison, level limit) are drawn. */
export type SubRoll = {
	meta: MetaArchetypeKey;
	/** Key of the sub archetype, stored in Tournament.formatName */
	key: string;
	/** Authorized races */
	teamRace: RaceEnum[];
	/** Imposed team size, else drawn between TEAM_SIZE_MIN and TEAM_SIZE_MAX at creation */
	teamSize?: number;
	/** Possible team sizes when the sub restricts them without fixing one (e.g. pairs: 4 or 6) */
	teamSizes?: number[];
	/** Imposed minimum number of races, else drawn between 2 and teamSize */
	raceMinimum?: number;
	rules: TournamentRules;
	/** Extra raw parameters of the description that are not part of the rules (e.g. the element of element_native) */
	params?: Record<string, unknown>;
};

/** History of the previous tournaments, used by the echo subs. Computed by the backend. */
export type ArchetypeContext = {
	/** Number of dinoz of each race in the teams qualified for the last tournament */
	lastQualifiedRaces: Partial<Record<RaceEnum, number>>;
	/** Number of dinoz of each race registered over the last 3 tournaments */
	recentRegisteredRaces: Partial<Record<RaceEnum, number>>;
	/** Races of the day of the last qualification */
	lastFeaturedRaces: RaceEnum[];
	/** Races of the team that won the last tournament */
	lastChampionRaces: RaceEnum[];
	/** Number of dinoz owning each skill among the 8 finalist teams of the last tournament */
	lastFinalistSkills: Partial<Record<Skill, number>>;
	/** Number of dinoz of each race in the game (active ones), used to weight monorace */
	racePopulation: Partial<Record<RaceEnum, number>>;
	/**
	 * Races that can be drawn (monorace, duo/trio, outsiders): the ones owned by enough players. Every race when
	 * undefined. Fixed race lists (flying, common...) are not filtered.
	 */
	availableRaces?: RaceEnum[];
	/** Random generator returning a float in [0, 1), Math.random by default (injectable for tests) */
	random?: () => number;
};

export type SubArchetypeDef = {
	key: string;
	enabled: boolean;
	/** Relative weight when picking the candidates of a vote */
	weight: number;
	/** False when the sub cannot be rolled with the given context (e.g. echo without history) */
	isAvailable?: (ctx: ArchetypeContext) => boolean;
	roll: (ctx: ArchetypeContext) => SubRoll;
};

export type MetaArchetypeDef = {
	key: MetaArchetypeKey;
	enabled: boolean;
	/** Position in the rotation */
	order: number;
	subs: SubArchetypeDef[];
};

/** Candidate stored in Tournament.nextCandidates, index = poll option orderIndex */
export type ArchetypeCandidate = SubRoll;

/** Team size drawn for races, restrictive and echo when the sub does not impose one */
export const TEAM_SIZE_MIN = 3;
export const TEAM_SIZE_MAX = 6;
/** Number of sub archetypes proposed to the vote */
export const VOTE_CANDIDATES = 3;

/** Dinoz data needed to validate a team against the tournament rules */
export type TeamDinoz = {
	id: number;
	level: number;
	raceId: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	skills: { skillId: number }[];
	/** Statuses of the dinoz: when provided, a demon is detected by its DEMON status, else by its demon skills */
	status?: { statusId: number }[];
};

/** Tournament parameters needed to validate a team */
export type TournamentTeamConstraints = {
	teamSize: number;
	raceMinimum: number;
	teamRace: RaceEnum[];
	levelLimit: number;
	rules: TournamentRules;
};

/** First failed constraint: translation key under `tournament.archetype.error.*` and its parameters */
export type TeamValidationError = { key: string; params?: Record<string, unknown> };

/** Random generator returning a float in [0, 1) */
type Random = () => number;

const rngOf = (ctx: ArchetypeContext): Random => ctx.random ?? Math.random;

/** Random integer between min and max, both included */
export function randomInt(random: Random, min: number, max: number): number {
	return min + Math.min(max - min, Math.floor(random() * (max - min + 1)));
}

function pickOne<T>(random: Random, list: readonly T[]): T {
	return list[Math.min(list.length - 1, Math.floor(random() * list.length))];
}

/** Up to n distinct elements of the list, in random order */
function pickDistinct<T>(random: Random, list: readonly T[], n: number): T[] {
	const copy = [...list];
	const result: T[] = [];
	while (result.length < n && copy.length > 0) {
		result.push(copy.splice(Math.min(copy.length - 1, Math.floor(random() * copy.length)), 1)[0]);
	}
	return result;
}

/** Index of an item picked at random weighted by `weight`, -1 when no item has a positive weight */
function weightedIndex<T>(random: Random, items: readonly T[], weight: (item: T) => number): number {
	const weights = items.map(i => Math.max(0, weight(i)));
	const total = weights.reduce((a, b) => a + b, 0);
	if (total <= 0) return -1;
	let roll = random() * total;
	let last = -1;
	for (let i = 0; i < items.length; i++) {
		if (weights[i] <= 0) continue;
		last = i;
		roll -= weights[i];
		if (roll < 0) return i;
	}
	// Floating point safety
	return last;
}

/** Races sorted by count (ascending or descending), ties broken at random. Races absent from counts count as 0. */
function racesByCount(
	random: Random,
	counts: Partial<Record<RaceEnum, number>>,
	order: 'asc' | 'desc',
	races: readonly RaceEnum[] = ALL_RACES
): RaceEnum[] {
	const shuffled = pickDistinct(random, races, races.length);
	const sign = order === 'asc' ? 1 : -1;
	return shuffled.sort((a, b) => sign * ((counts[a] ?? 0) - (counts[b] ?? 0)));
}

const hasPositive = (record: Partial<Record<number, number>> | undefined) =>
	Object.values(record ?? {}).some(v => (v ?? 0) > 0);

const unique = <T,>(list: readonly T[] | undefined): T[] => [...new Set(list ?? [])];

/** Races that can be drawn with this context: availableRaces when provided, else every race */
export const drawableRaces = (ctx: ArchetypeContext): RaceEnum[] =>
	ctx.availableRaces ? ALL_RACES.filter(r => ctx.availableRaces!.includes(r)) : [...ALL_RACES];

const atLeastDrawable = (n: number) => (ctx: ArchetypeContext) => drawableRaces(ctx).length >= n;

/** Races of the existing formats, reused as data */
const formatRaces = (format: formatName): RaceEnum[] => [...formatTID[format].teamRace];

/** Native races of each element (lists of the former element formats) */
export const NATIVE_RACES: Record<UpElement, RaceEnum[]> = {
	[ElementType.FIRE]: formatRaces(formatName.FIRE),
	[ElementType.WOOD]: formatRaces(formatName.WOOD),
	[ElementType.WATER]: formatRaces(formatName.WATER),
	[ElementType.LIGHTNING]: formatRaces(formatName.LIGHTNING),
	[ElementType.AIR]: formatRaces(formatName.AIR)
};

const FLYING_RACES = formatRaces(formatName.FLYING);

/**
 * Skills drawn by `skill_required`: the first skills of each element tree (base tree, not a sphere skill, no race
 * restriction), learnable by every dinoz levelling the element.
 */
export const REQUIRED_SKILL_POOL: Skill[] = [
	Skill.GRIFFES_ENFLAMMEES,
	Skill.COLERE,
	Skill.FORCE,
	Skill.CARAPACE,
	Skill.SAUVAGERIE,
	Skill.ENDURANCE,
	Skill.CANON_A_EAU,
	Skill.PERCEPTION,
	Skill.MUTATION,
	Skill.INTELLIGENCE,
	Skill.FOCUS,
	Skill.CELERITE,
	Skill.AGILITE,
	Skill.STRATEGIE,
	Skill.MISTRAL
];

/** Skills drawn by `skill_forbidden`: strong skills of the base tree (not sphere skills), widespread in tournaments */
export const FORBIDDEN_SKILL_POOL: Skill[] = [
	Skill.CHEF_DE_GUERRE,
	Skill.BRAVE,
	Skill.MAITRE_ELEMENTAIRE,
	Skill.ESPRIT_GORILLOZ,
	Skill.COLOSSE,
	Skill.GRIFFES_EMPOISONNEES,
	Skill.SANG_ACIDE,
	Skill.MAITRE_NAGEUR,
	Skill.BENEDICTION,
	Skill.REINCARNATION,
	Skill.ARCHANGE_CORROSIF,
	Skill.MEDITATION_TRANSCENDANTALE,
	Skill.SOUFFLE_DE_VIE
];

type RollBody = Omit<SubRoll, 'meta' | 'key'>;

type SubOptions = { enabled?: boolean; weight?: number; isAvailable?: (ctx: ArchetypeContext) => boolean };

/** Declare a sub archetype: `roll` only returns the specific part, meta and key are added */
function defineSub(
	meta: MetaArchetypeKey,
	key: string,
	roll: (random: Random, ctx: ArchetypeContext) => RollBody,
	options: SubOptions = {}
): SubArchetypeDef {
	return {
		key,
		enabled: options.enabled ?? true,
		weight: options.weight ?? 1,
		isAvailable: options.isAvailable,
		roll: ctx => ({ meta, key, ...roll(rngOf(ctx), ctx) })
	};
}

/** Sub of the races meta restricting the races to a fixed list */
const raceListSub = (key: string, races: () => RaceEnum[]) =>
	defineSub('races', key, () => ({ teamRace: races(), rules: {} }));

/** Sub of the restrictive meta: every race, a constraint on the build */
const restrictiveSub = (
	key: string,
	rules: (random: Random) => TournamentRules,
	options: { enabled?: boolean; teamSizes?: number[] } = {}
) =>
	defineSub(
		'restrictive',
		key,
		random => ({
			teamRace: [...ALL_RACES],
			...(options.teamSizes ? { teamSizes: [...options.teamSizes] } : {}),
			rules: rules(random)
		}),
		{ enabled: options.enabled }
	);

/** Sub of the ffa meta: every race, no rule, no race minimum, team size imposed (drawn 3–6 when undefined) */
const ffaSub = (key: string, teamSize?: number) =>
	defineSub('ffa', key, () => ({
		teamRace: [...ALL_RACES],
		...(teamSize ? { teamSize } : {}),
		raceMinimum: 1,
		rules: {}
	}));

const allRacesExcept = (excluded: readonly RaceEnum[]) => ALL_RACES.filter(r => !excluded.includes(r));

/** Most frequent skill of the record (ties broken at random), undefined when empty */
/**
 * Only the skills of FORBIDDEN_SKILL_POOL can be banned by skill_echo: a base skill (or a demon/sphere one) owned by
 * most dinoz would leave most players without a valid team, since skills cannot be unlearned.
 */
function forbiddableSkillCounts(counts: Partial<Record<Skill, number>>): Partial<Record<Skill, number>> {
	return Object.fromEntries(
		Object.entries(counts).filter(([skill]) => FORBIDDEN_SKILL_POOL.includes(Number(skill) as Skill))
	) as Partial<Record<Skill, number>>;
}

function mostFrequentSkill(random: Random, counts: Partial<Record<Skill, number>>): Skill | undefined {
	const entries = Object.entries(counts)
		.map(([skill, count]) => [Number(skill) as Skill, count ?? 0] as const)
		.filter(([, count]) => count > 0);
	if (entries.length === 0) return undefined;
	const max = Math.max(...entries.map(([, count]) => count));
	return pickOne(
		random,
		entries.filter(([, count]) => count === max).map(([skill]) => skill)
	);
}

/**
 * Catalogue of the meta archetypes, in rotation order. Purely declarative: add a sub (and its i18n keys under
 * `tournament.archetype.sub.<key>`) or disable one with `enabled: false`, without touching the engine.
 */
export const metaArchetypes: MetaArchetypeDef[] = [
	{
		key: 'races',
		enabled: true,
		order: 1,
		subs: [
			defineSub(
				'races',
				'monorace',
				(random, ctx) => {
					const races = drawableRaces(ctx);
					const index = weightedIndex(random, races, r => ctx.racePopulation?.[r] ?? 0);
					const race = index >= 0 ? races[index] : pickOne(random, races);
					return { teamRace: [race], raceMinimum: 1, rules: {} };
				},
				{ isAvailable: atLeastDrawable(1) }
			),
			defineSub('races', 'clan', () => ({ teamRace: [...ALL_RACES], raceMinimum: 1, rules: { sameRace: true } })),
			defineSub(
				'races',
				'duo_race',
				(random, ctx) => ({ teamRace: pickDistinct(random, drawableRaces(ctx), 2), raceMinimum: 2, rules: {} }),
				{ isAvailable: atLeastDrawable(2) }
			),
			defineSub(
				'races',
				'trio_race',
				(random, ctx) => ({ teamRace: pickDistinct(random, drawableRaces(ctx), 3), raceMinimum: 3, rules: {} }),
				{ isAvailable: atLeastDrawable(3) }
			),
			defineSub('races', 'binomes', () => ({ teamRace: [...ALL_RACES], teamSizes: [4, 6], rules: { pairs: true } })),
			raceListSub('common', () => formatRaces(formatName.COMMON)),
			raceListSub('uncommon', () => formatRaces(formatName.UNCOMMON)),
			raceListSub('flying', () => [...FLYING_RACES]),
			raceListSub('terrestrial', () => allRacesExcept(FLYING_RACES)),
			raceListSub('bipede', () => formatRaces(formatName.BIPEDE)),
			raceListSub('quadrupede', () => formatRaces(formatName.QUADRUPEDE)),
			defineSub('races', 'element_native', random => {
				const element = pickOne(random, UP_ELEMENTS);
				return { teamRace: [...NATIVE_RACES[element]], rules: {}, params: { element } };
			}),
			// Only the races having a demon variant can field demons
			defineSub('races', 'demons', () => ({ teamRace: [...DEMON_RACES], rules: { demon: 'only' } })),
			defineSub('races', 'no_demon', () => ({ teamRace: [...ALL_RACES], rules: { demon: 'none' } })),
			defineSub('races', 'demon_captain', () => ({ teamRace: [...ALL_RACES], rules: { demon: 'exactlyOne' } })),
			// A demon captain followed by dinoz of its race that are not demons
			defineSub('races', 'follow_the_demon', () => ({
				teamRace: [...DEMON_RACES],
				raceMinimum: 1,
				rules: { demon: 'exactlyOne', sameRace: true }
			}))
		]
	},
	{
		key: 'restrictive',
		enabled: true,
		order: 2,
		subs: [
			restrictiveSub('element_min', random => ({
				elementMin: { element: pickOne(random, UP_ELEMENTS), min: randomInt(random, 5, 15) }
			})),
			restrictiveSub('element_dominant', random => ({ elementDominant: pickOne(random, UP_ELEMENTS) })),
			restrictiveSub('elemental_purity', () => ({ elementPurity: true })),
			// Only 5 elements: at most 5 dinoz
			restrictiveSub('rainbow', () => ({ rainbow: true }), { teamSizes: [3, 4, 5] }),
			restrictiveSub('specialists', () => ({ specialistPct: 50 })),
			restrictiveSub('balanced', () => ({ balancedPct: 35 })),
			restrictiveSub('skill_required', random => ({ skillRequired: pickOne(random, REQUIRED_SKILL_POOL) })),
			restrictiveSub('skill_forbidden', random => ({ skillForbidden: pickOne(random, FORBIDDEN_SKILL_POOL) })),
			// Invocations and the Ether tree are not unlocked in the game yet
			restrictiveSub('summoners', () => ({ summon: 'required' }), { enabled: false }),
			restrictiveSub('no_summon', () => ({ summon: 'none' }), { enabled: false }),
			restrictiveSub('ether_adepts', () => ({ etherMin: 2 }), { enabled: false }),
			restrictiveSub('purists', () => ({ purist: true })),
			restrictiveSub('full_diversity', () => ({ distinctRaces: true })),
			restrictiveSub('level_budget', () => ({ levelBudgetPct: 80 })),
			restrictiveSub('promotion', () => ({ levelSpread: 5 }))
		]
	},
	{
		key: 'ffa',
		enabled: true,
		order: 3,
		subs: [
			ffaSub('ffa_solo', 1),
			ffaSub('ffa_duo', 2),
			ffaSub('ffa_trio', 3),
			ffaSub('ffa_squad', 5),
			ffaSub('ffa_legion', 6),
			ffaSub('ffa_open')
		]
	},
	{
		key: 'echo',
		enabled: true,
		order: 4,
		subs: [
			defineSub(
				'echo',
				'anti_meta',
				(random, ctx) => {
					const forbidden = racesByCount(random, ctx.lastQualifiedRaces, 'desc')
						.filter(r => (ctx.lastQualifiedRaces[r] ?? 0) > 0)
						.slice(0, 5);
					return { teamRace: allRacesExcept(forbidden), rules: { forbiddenRaces: forbidden } };
				},
				{ isAvailable: ctx => hasPositive(ctx.lastQualifiedRaces) }
			),
			defineSub(
				'echo',
				'outsiders',
				(random, ctx) => ({
					teamRace: racesByCount(random, ctx.recentRegisteredRaces, 'asc', drawableRaces(ctx)).slice(0, 8),
					rules: {}
				}),
				{ isAvailable: ctx => hasPositive(ctx.recentRegisteredRaces) && atLeastDrawable(1)(ctx) }
			),
			defineSub('echo', 'vedettes', (_random, ctx) => ({ teamRace: unique(ctx.lastFeaturedRaces), rules: {} }), {
				isAvailable: ctx => unique(ctx.lastFeaturedRaces).length > 0
			}),
			defineSub(
				'echo',
				'champion_ban',
				(_random, ctx) => {
					const forbidden = unique(ctx.lastChampionRaces);
					return { teamRace: allRacesExcept(forbidden), rules: { forbiddenRaces: forbidden } };
				},
				{ isAvailable: ctx => unique(ctx.lastChampionRaces).length > 0 }
			),
			defineSub(
				'echo',
				'heritage',
				(_random, ctx) => ({ teamRace: [...ALL_RACES], rules: { requireOneOf: unique(ctx.lastChampionRaces) } }),
				{ isAvailable: ctx => unique(ctx.lastChampionRaces).length > 0 }
			),
			defineSub(
				'echo',
				'skill_echo',
				(random, ctx) => ({
					teamRace: [...ALL_RACES],
					rules: { skillForbidden: mostFrequentSkill(random, forbiddableSkillCounts(ctx.lastFinalistSkills)) }
				}),
				{ isAvailable: ctx => hasPositive(forbiddableSkillCounts(ctx.lastFinalistSkills)) }
			)
		]
	}
];

const activeMetas = (catalogue: MetaArchetypeDef[]) =>
	catalogue.filter(m => m.enabled).sort((a, b) => a.order - b.order);

/**
 * @summary Next active meta archetype in the rotation, the first active one if `previous` is unknown or disabled.
 * @throws Error when no meta archetype is active
 */
export function nextMeta(
	previous: MetaArchetypeKey | null,
	catalogue: MetaArchetypeDef[] = metaArchetypes
): MetaArchetypeDef {
	const metas = activeMetas(catalogue);
	if (metas.length === 0) throw new Error('No active meta archetype');
	const index = metas.findIndex(m => m.key === previous);
	return index < 0 ? metas[0] : metas[(index + 1) % metas.length];
}

/** Meta archetype of the catalogue by key (enabled or not) */
export function findMetaArchetype(
	key: MetaArchetypeKey,
	catalogue: MetaArchetypeDef[] = metaArchetypes
): MetaArchetypeDef | undefined {
	return catalogue.find(m => m.key === key);
}

/** Sub archetype of the catalogue by key (enabled or not) and its meta */
export function findSubArchetype(
	key: string,
	catalogue: MetaArchetypeDef[] = metaArchetypes
): { meta: MetaArchetypeDef; sub: SubArchetypeDef } | undefined {
	for (const meta of catalogue) {
		const sub = meta.subs.find(s => s.key === key);
		if (sub) return { meta, sub };
	}
	return undefined;
}

/** Enabled subs of the meta (with a positive weight) that can be rolled with the context */
export function availableSubs(meta: MetaArchetypeDef, ctx: ArchetypeContext): SubArchetypeDef[] {
	return meta.subs.filter(s => s.enabled && s.weight > 0 && (s.isAvailable?.(ctx) ?? true));
}

/**
 * @summary Roll up to VOTE_CANDIDATES distinct available subs of the given meta.
 * If the meta has no available sub, the following metas are tried in rotation order (one full turn at most, [] when
 * no meta has an available sub). An unknown or disabled meta starts from the first active one.
 * Subs are picked by weight without replacement, each candidate is the result of its `roll`.
 */
export function rollCandidates(
	meta: MetaArchetypeKey,
	ctx: ArchetypeContext,
	catalogue: MetaArchetypeDef[] = metaArchetypes
): ArchetypeCandidate[] {
	const metas = activeMetas(catalogue);
	const random = rngOf(ctx);
	const start = Math.max(
		0,
		metas.findIndex(m => m.key === meta)
	);
	for (let i = 0; i < metas.length; i++) {
		const pool = availableSubs(metas[(start + i) % metas.length], ctx);
		if (pool.length === 0) continue;
		const candidates: ArchetypeCandidate[] = [];
		while (candidates.length < VOTE_CANDIDATES && pool.length > 0) {
			const index = weightedIndex(random, pool, s => s.weight);
			candidates.push(pool.splice(index, 1)[0].roll(ctx));
		}
		return candidates;
	}
	return [];
}

/**
 * @summary Team size of a new tournament: imposed by the sub, else picked among the sub's teamSizes, else drawn
 * between TEAM_SIZE_MIN and TEAM_SIZE_MAX.
 */
export function resolveTeamSize(roll: SubRoll, random: Random = Math.random): number {
	if (roll.teamSize !== undefined) return roll.teamSize;
	if (roll.teamSizes && roll.teamSizes.length > 0) return pickOne(random, roll.teamSizes);
	return randomInt(random, TEAM_SIZE_MIN, TEAM_SIZE_MAX);
}

/**
 * @summary Minimum number of races of a new tournament, capped by the team size and the number of authorized races:
 * imposed by the sub, else implied by its rules (sameRace → 1, pairs → teamSize / 2, distinctRaces → teamSize),
 * else drawn between 2 and the cap.
 */
export function resolveRaceMinimum(roll: SubRoll, teamSize: number, random: Random = Math.random): number {
	const forbidden = roll.rules.forbiddenRaces ?? [];
	const authorized = unique(roll.teamRace).filter(r => !forbidden.includes(r)).length;
	const cap = Math.max(1, Math.min(teamSize, authorized));
	if (roll.raceMinimum !== undefined) return Math.min(roll.raceMinimum, cap);
	if (roll.rules.sameRace) return 1;
	if (roll.rules.pairs) return Math.max(1, Math.min(Math.floor(teamSize / 2), cap));
	if (roll.rules.distinctRaces) return cap;
	return randomInt(random, Math.min(2, cap), cap);
}

/**
 * @summary Raw parameters to interpolate in `tournament.archetype.sub.<key>.description` (the caller formats them):
 * races (authorized races), forbidden / required (race lists), element, min, skill, pct, max, size, sizes.
 */
/** Element whose native races are exactly `races` (element_native), undefined if none matches. */
export function nativeElementOf(races: RaceEnum[]): UpElement | undefined {
	const set = new Set(races);
	return (Object.keys(NATIVE_RACES).map(Number) as UpElement[]).find(
		element => NATIVE_RACES[element].length === set.size && NATIVE_RACES[element].every(r => set.has(r))
	);
}

export function subDescriptionParams(roll: SubRoll): Record<string, unknown> {
	const r = roll.rules;
	// The params of a roll are not stored with the tournament: rebuild the element of element_native from its races
	const nativeElement = roll.key === 'element_native' ? nativeElementOf(roll.teamRace) : undefined;
	return {
		races: roll.teamRace,
		...(roll.teamSize !== undefined ? { size: roll.teamSize } : {}),
		...(roll.teamSizes ? { sizes: roll.teamSizes } : {}),
		...(r.forbiddenRaces ? { forbidden: r.forbiddenRaces } : {}),
		...(r.requireOneOf ? { required: r.requireOneOf } : {}),
		...(r.elementMin ? { element: r.elementMin.element, min: r.elementMin.min } : {}),
		...(r.elementDominant !== undefined ? { element: r.elementDominant } : {}),
		...(r.skillRequired !== undefined ? { skill: r.skillRequired } : {}),
		...(r.skillForbidden !== undefined ? { skill: r.skillForbidden } : {}),
		...(r.specialistPct !== undefined ? { pct: r.specialistPct } : {}),
		...(r.balancedPct !== undefined ? { pct: r.balancedPct } : {}),
		...(r.levelBudgetPct !== undefined ? { pct: r.levelBudgetPct } : {}),
		...(r.etherMin !== undefined ? { min: r.etherMin } : {}),
		...(r.levelSpread !== undefined ? { max: r.levelSpread } : {}),
		...(nativeElement !== undefined ? { element: nativeElement } : {}),
		...roll.params
	};
}

/**
 * @summary First failed constraint of the team, null when the team is valid.
 * Checks in order: team size, authorized races (teamRace), level limit, race minimum, then every rule of `rules`
 * (forbidden races first). The error key is relative to `tournament.archetype.error.*`, its params are raw values
 * (race ids, element id, skill id, numbers) to format by the caller.
 */
export function validateTeamAgainstRules(
	team: TeamDinoz[],
	tournament: TournamentTeamConstraints
): TeamValidationError | null {
	return validateTeam(team, tournament);
}

export {
	ALL_RACES,
	DEMON_RACES,
	UP_ELEMENTS,
	describeRules,
	dominantElements,
	isDemonDinoz,
	levelBudget
} from './tournamentRules.mjs';
export type { RuleDescription } from './tournamentRules.mjs';
