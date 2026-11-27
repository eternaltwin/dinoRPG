import { ElementType } from '../enums/ElementType.mjs';
import { RaceEnum } from '../enums/RaceEnum.mjs';
import { SkillTreeType } from '../enums/SkillTreeType.mjs';
import { SkillType } from '../enums/SkillType.mjs';
import { raceList } from '../dinoz/RaceList.mjs';
import { Skill, skillList } from '../dinoz/SkillList.mjs';
import { DinozStatusId } from '../dinoz/StatusList.mjs';
import type {
	TeamDinoz,
	TeamValidationError,
	TournamentRules,
	TournamentTeamConstraints,
	UpElement
} from './tournamentArchetypes.mjs';

/**
 * Validators of the tournament rules (`TournamentRules`), independent from the sub archetypes: a new sub can combine
 * existing rules without new validation code. Pure functions, shared by the backend and the frontend.
 */

/** Elements a dinoz can level up, in ElementType order */
export const UP_ELEMENTS: UpElement[] = [
	ElementType.FIRE,
	ElementType.WOOD,
	ElementType.WATER,
	ElementType.LIGHTNING,
	ElementType.AIR
];

/** Every race of the game */
export const ALL_RACES: RaceEnum[] = Object.values(RaceEnum).filter((r): r is RaceEnum => typeof r === 'number');

/** Races having a demon variant */
export const DEMON_RACES: RaceEnum[] = ALL_RACES.filter(r => raceList[r].demon);

/** Number of level ups of the dinoz in the given element */
export function upCount(dinoz: TeamDinoz, element: UpElement): number {
	switch (element) {
		case ElementType.FIRE:
			return dinoz.nbrUpFire;
		case ElementType.WOOD:
			return dinoz.nbrUpWood;
		case ElementType.WATER:
			return dinoz.nbrUpWater;
		case ElementType.LIGHTNING:
			return dinoz.nbrUpLightning;
		case ElementType.AIR:
			return dinoz.nbrUpAir;
	}
}

function totalUps(dinoz: TeamDinoz): number {
	return UP_ELEMENTS.reduce((sum, e) => sum + upCount(dinoz, e), 0);
}

function maxUps(dinoz: TeamDinoz): number {
	return Math.max(...UP_ELEMENTS.map(e => upCount(dinoz, e)));
}

/**
 * @summary Dominant elements of a dinoz: the elements with the highest number of level ups.
 * Ties: every element sharing the maximum is dominant (a 5 fire / 5 water dinoz is dominant in both fire and water).
 * A dinoz without any level up has no dominant element.
 */
export function dominantElements(dinoz: TeamDinoz): UpElement[] {
	const max = maxUps(dinoz);
	if (max <= 0) return [];
	return UP_ELEMENTS.filter(e => upCount(dinoz, e) === max);
}

/**
 * @summary A dinoz is a demon when it has the DEMON status (the convention of the backend) or, when its statuses are
 * not provided, when it owns one of the demon skills of its race (given to every demon at its creation).
 */
export function isDemonDinoz(dinoz: TeamDinoz): boolean {
	if (dinoz.status) return dinoz.status.some(s => s.statusId === DinozStatusId.DEMON);
	const demonSkills: Skill[] = raceList[dinoz.raceId as RaceEnum]?.demon?.skills ?? [];
	return dinoz.skills.some(s => demonSkills.includes(s.skillId));
}

function hasSkill(dinoz: TeamDinoz, skill: Skill): boolean {
	return dinoz.skills.some(s => s.skillId === skill);
}

function skillDetails(skillId: number) {
	return skillList[skillId as Skill];
}

function skillIsInvocation(skillId: number): boolean {
	return skillDetails(skillId)?.type === SkillType.I;
}

function skillIsEther(skillId: number): boolean {
	return skillDetails(skillId)?.tree === SkillTreeType.ETHER;
}

function skillIsSphere(skillId: number): boolean {
	return skillDetails(skillId)?.isSphereSkill === true;
}

/** True when one dominant element can be chosen for each dinoz, all different (backtracking, team ≤ 6 dinoz) */
function hasDistinctDominants(choices: UpElement[][], used: Set<UpElement> = new Set(), index = 0): boolean {
	if (index >= choices.length) return true;
	for (const element of choices[index]) {
		if (used.has(element)) continue;
		used.add(element);
		if (hasDistinctDominants(choices, used, index + 1)) return true;
		used.delete(element);
	}
	return false;
}

function raceCounts(team: TeamDinoz[]): Map<number, number> {
	const counts = new Map<number, number>();
	for (const d of team) counts.set(d.raceId, (counts.get(d.raceId) ?? 0) + 1);
	return counts;
}

type RuleValidator<K extends keyof TournamentRules> = (
	value: NonNullable<TournamentRules[K]>,
	team: TeamDinoz[],
	tournament: TournamentTeamConstraints
) => TeamValidationError | null;

const fail = (key: string, params?: Record<string, unknown>): TeamValidationError => ({ key, params });

/**
 * Validator of each rule, checked in this order. Error keys are relative to `tournament.archetype.error.*`.
 * Params are raw values (race ids, element ids, skill ids, numbers): the caller formats them for display.
 */
export const ruleValidators: { [K in keyof Required<TournamentRules>]: RuleValidator<K> } = {
	forbiddenRaces: (races, team) => {
		const dinoz = team.find(d => races.includes(d.raceId));
		return dinoz ? fail('forbiddenRace', { race: dinoz.raceId }) : null;
	},
	demon: (mode, team) => {
		const demons = team.filter(d => isDemonDinoz(d)).length;
		if (mode === 'only' && demons !== team.length) return fail('demonOnly');
		if (mode === 'none' && demons > 0) return fail('demonNone');
		if (mode === 'exactlyOne' && demons !== 1) return fail('demonExactlyOne');
		return null;
	},
	sameRace: (enabled, team) => (enabled && raceCounts(team).size > 1 ? fail('sameRace') : null),
	pairs: (enabled, team) =>
		enabled && [...raceCounts(team).values()].some(count => count % 2 !== 0) ? fail('pairs') : null,
	distinctRaces: (enabled, team) => (enabled && raceCounts(team).size !== team.length ? fail('distinctRaces') : null),
	requireOneOf: (races, team) =>
		races.length > 0 && !team.some(d => races.includes(d.raceId)) ? fail('requireOneOf', { races }) : null,
	elementMin: ({ element, min }, team) =>
		team.some(d => upCount(d, element) < min) ? fail('elementMin', { element, min }) : null,
	elementDominant: (element, team) =>
		team.some(d => !dominantElements(d).includes(element)) ? fail('elementDominant', { element }) : null,
	elementPurity: (enabled, team) => {
		if (!enabled || team.length === 0) return null;
		const common = team
			.map(d => dominantElements(d))
			.reduce((acc, elements) => acc.filter(e => elements.includes(e)), UP_ELEMENTS);
		return common.length === 0 ? fail('elementPurity') : null;
	},
	rainbow: (enabled, team) =>
		enabled && !hasDistinctDominants(team.map(d => dominantElements(d))) ? fail('rainbow') : null,
	specialistPct: (pct, team) =>
		team.some(d => totalUps(d) === 0 || maxUps(d) * 100 < pct * totalUps(d)) ? fail('specialist', { pct }) : null,
	balancedPct: (pct, team) => (team.some(d => maxUps(d) * 100 > pct * totalUps(d)) ? fail('balanced', { pct }) : null),
	skillRequired: (skill, team) => (team.some(d => !hasSkill(d, skill)) ? fail('skillRequired', { skill }) : null),
	skillForbidden: (skill, team) => (team.some(d => hasSkill(d, skill)) ? fail('skillForbidden', { skill }) : null),
	summon: (mode, team) => {
		if (mode === 'required' && team.some(d => !d.skills.some(s => skillIsInvocation(s.skillId))))
			return fail('summonRequired');
		if (mode === 'none' && team.some(d => d.skills.some(s => skillIsInvocation(s.skillId)))) return fail('summonNone');
		return null;
	},
	purist: (enabled, team) =>
		enabled && team.some(d => d.skills.some(s => skillIsEther(s.skillId) || skillIsSphere(s.skillId)))
			? fail('purist')
			: null,
	etherMin: (min, team) =>
		team.some(d => d.skills.filter(s => skillIsEther(s.skillId)).length < min) ? fail('etherMin', { min }) : null,
	levelBudgetPct: (pct, team, tournament) => {
		const max = levelBudget(tournament.levelLimit, tournament.teamSize, pct);
		const sum = team.reduce((acc, d) => acc + d.level, 0);
		return sum > max ? fail('levelBudget', { max, sum }) : null;
	},
	levelSpread: (spread, team) => {
		if (team.length === 0) return null;
		const levels = team.map(d => d.level);
		return Math.max(...levels) - Math.min(...levels) > spread ? fail('levelSpread', { max: spread }) : null;
	}
};

/** Maximum sum of the levels of a team for the level budget rule */
export function levelBudget(levelLimit: number, teamSize: number, pct: number): number {
	return Math.floor((levelLimit * teamSize * pct) / 100);
}

/**
 * @summary First failed constraint of the team, null when the team is valid.
 * Order: team size, authorized races, level limit, race minimum, then each rule (see `ruleValidators`).
 */
export function validateTeam(team: TeamDinoz[], tournament: TournamentTeamConstraints): TeamValidationError | null {
	if (team.length !== tournament.teamSize) return fail('teamSize', { qty: tournament.teamSize });

	const wrongRace = team.find(d => !tournament.teamRace.includes(d.raceId));
	if (wrongRace) return fail('wrongRace', { race: wrongRace.raceId });

	if (team.some(d => d.level > tournament.levelLimit)) return fail('levelTooHigh', { max: tournament.levelLimit });

	if (raceCounts(team).size < tournament.raceMinimum) return fail('notEnoughRaces', { qty: tournament.raceMinimum });

	const rules = tournament.rules ?? {};
	for (const field of Object.keys(ruleValidators) as (keyof TournamentRules)[]) {
		const value = rules[field];
		if (value === undefined || value === null || value === false) continue;
		const validator = ruleValidators[field] as RuleValidator<typeof field>;
		const error = validator(value as never, team, tournament);
		if (error) return error;
	}
	return null;
}

/** A rule to display: translation key under `tournament.archetype.rule.*` and its raw parameters */
export type RuleDescription = { key: string; params?: Record<string, unknown> };

/**
 * @summary Describe the rules of a tournament, one entry per active rule, in the validation order.
 * Keys are relative to `tournament.archetype.rule.*`. Params are raw values to format by the caller:
 * - numeric rules (specialistPct, balancedPct, etherMin, levelBudgetPct, levelSpread): `value`;
 * - demon / summon: key `<field>_<value>` (i18next context), param `value`;
 * - race lists (forbiddenRaces, requireOneOf): `races` (race ids) and `count`;
 * - elementMin: `element`, `min`; elementDominant: `element`; skillRequired / skillForbidden: `skill` (skill id);
 * - boolean rules: no param.
 */
export function describeRules(rules: TournamentRules | null | undefined): RuleDescription[] {
	if (!rules) return [];
	const descriptions: RuleDescription[] = [];
	for (const field of Object.keys(ruleValidators) as (keyof TournamentRules)[]) {
		const value = rules[field];
		if (value === undefined || value === null || value === false) continue;
		if (Array.isArray(value) && value.length === 0) continue;
		switch (field) {
			case 'demon':
			case 'summon':
				descriptions.push({ key: `${field}_${value}`, params: { value } });
				break;
			case 'forbiddenRaces':
			case 'requireOneOf':
				descriptions.push({ key: field, params: { races: value, count: (value as RaceEnum[]).length } });
				break;
			case 'elementMin':
				descriptions.push({ key: field, params: { ...(value as object) } });
				break;
			case 'elementDominant':
				descriptions.push({ key: field, params: { element: value } });
				break;
			case 'skillRequired':
			case 'skillForbidden':
				descriptions.push({ key: field, params: { skill: value } });
				break;
			case 'specialistPct':
			case 'balancedPct':
			case 'levelBudgetPct':
			case 'etherMin':
			case 'levelSpread':
				descriptions.push({ key: field, params: { value } });
				break;
			default:
				descriptions.push({ key: field });
		}
	}
	return descriptions;
}
