import { raceList as coreRaceList } from '@drpg/core/models/dinoz/RaceList';
import { skillList, Skill } from '@drpg/core/models/dinoz/SkillList';
import { ElementNames } from '@drpg/core/models/enums/ElementType';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import {
	TeamDinoz,
	TeamValidationError,
	TournamentRules,
	TournamentTeamConstraints,
	validateTeamAgainstRules
} from '@drpg/core/models/dojo/tournamentArchetypes';
import { raceList } from '../constants/race.js';

/** Race of a dinoz from its display: the first character is the swf letter of its race (a demon keeps its race). */
const raceBySwfLetter: Record<string, number> = Object.fromEntries(
	Object.values(coreRaceList).map(race => [race.swfLetter, race.raceId])
);

export function raceIdFromDisplay(display: string | null | undefined): number | undefined {
	if (!display) return undefined;
	return raceBySwfLetter[display[0]];
}

/** Translation key of a race name. */
export function raceNameKey(raceId: number): string {
	return `race.name.${raceList[raceId] ?? raceId}`;
}

/** Number of distinct races (a demon counts as its race since it shares its raceId). */
export function countDistinctRaces(raceIds: (number | undefined)[]): number {
	return new Set(raceIds.filter((r): r is number => r !== undefined)).size;
}

/** Data of a dinoz of the player needed by validateTeamAgainstRules. */
export function toTeamDinoz(dinoz: DinozFiche): TeamDinoz {
	return {
		id: dinoz.id,
		level: dinoz.level,
		raceId: dinoz.race.raceId,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		skills: dinoz.skills.map(s => ({ skillId: s.skillId }))
	};
}

/**
 * @summary First rule broken by the team, null when valid, undefined when the validation cannot run
 * (validator not available yet): the backend stays the reference in that case.
 */
export function safeValidateTeam(
	team: TeamDinoz[],
	constraints: TournamentTeamConstraints
): TeamValidationError | null | undefined {
	try {
		return validateTeamAgainstRules(team, constraints);
	} catch {
		return undefined;
	}
}

export type RuleLine = {
	/** Translation key, under tournament.archetype.rule.* */
	key: string;
	params: Record<string, string | number>;
};

/** Value of a rule rendered as a parameter: elements as `:fire:` icons, skills and races translated. */
type Translator = (key: string) => string;

function elementParam(element: number): string {
	return `:${ElementNames[element]}:`;
}

function skillParam(skill: Skill, t: Translator): string {
	const details = skillList[skill];
	return details ? t(`skill.name.${details.name}`) : String(skill);
}

function racesParam(races: RaceEnum[], t: Translator): string {
	return races.map(r => t(raceNameKey(r))).join(', ');
}

/**
 * @summary One line per rule present in `rules`, with its translation key and parameters.
 * String-valued rules (demon, summon) use `tournament.archetype.rule.<field>.<value>` when that key exists.
 * Every line also gets a generic `value` parameter.
 */
export function describeRules(
	rules: TournamentRules | null | undefined,
	t: Translator,
	exists: (key: string) => boolean
): RuleLine[] {
	if (!rules) return [];
	const lines: RuleLine[] = [];
	const base = 'tournament.archetype.rule';
	for (const [field, raw] of Object.entries(rules) as [keyof TournamentRules, unknown][]) {
		if (raw === undefined || raw === null || raw === false) continue;
		if (Array.isArray(raw) && raw.length === 0) continue;
		let key = `${base}.${field}`;
		let params: Record<string, string | number> = {};
		switch (field) {
			case 'elementMin': {
				const rule = raw as NonNullable<TournamentRules['elementMin']>;
				params = { element: elementParam(rule.element), min: rule.min, value: rule.min };
				break;
			}
			case 'elementDominant':
				params = { element: elementParam(raw as number), value: elementParam(raw as number) };
				break;
			case 'skillRequired':
			case 'skillForbidden':
				params = { skill: skillParam(raw as Skill, t), value: skillParam(raw as Skill, t) };
				break;
			case 'requireOneOf':
			case 'forbiddenRaces':
				params = { races: racesParam(raw as RaceEnum[], t), value: racesParam(raw as RaceEnum[], t) };
				break;
			case 'specialistPct':
			case 'balancedPct':
			case 'levelBudgetPct':
				params = { pct: raw as number, value: raw as number };
				break;
			case 'etherMin':
				params = { min: raw as number, value: raw as number };
				break;
			case 'levelSpread':
				params = { spread: raw as number, max: raw as number, value: raw as number };
				break;
			case 'demon':
			case 'summon':
				if (exists(`${key}.${raw}`)) key = `${key}.${raw}`;
				params = { value: raw as string };
				break;
			default:
				params = typeof raw === 'number' || typeof raw === 'string' ? { value: raw } : {};
		}
		lines.push({ key, params });
	}
	return lines;
}
