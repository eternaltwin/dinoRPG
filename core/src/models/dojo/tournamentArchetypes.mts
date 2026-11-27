import { ElementType } from '../enums/ElementType.mjs';
import { RaceEnum } from '../enums/RaceEnum.mjs';
import { Skill } from '../dinoz/SkillList.mjs';

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

export const metaArchetypes: MetaArchetypeDef[] = [];

/**
 * @summary Next active meta archetype in the rotation, the first active one if `previous` is unknown or disabled.
 */
export function nextMeta(_previous: MetaArchetypeKey | null): MetaArchetypeDef {
	throw new Error('Not implemented');
}

/**
 * @summary Roll up to VOTE_CANDIDATES distinct available subs of the given meta.
 * If the meta has no available sub, the following metas are tried in rotation order.
 */
export function rollCandidates(_meta: MetaArchetypeKey, _ctx: ArchetypeContext): ArchetypeCandidate[] {
	throw new Error('Not implemented');
}

/**
 * @summary First failed constraint of the team, null when the team is valid.
 */
export function validateTeamAgainstRules(
	_team: TeamDinoz[],
	_tournament: TournamentTeamConstraints
): TeamValidationError | null {
	throw new Error('Not implemented');
}
