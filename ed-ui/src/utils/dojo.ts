import { raceList as coreRaceList } from '@drpg/core/models/dinoz/RaceList';
import { skillList, Skill } from '@drpg/core/models/dinoz/SkillList';
import { ElementNames } from '@drpg/core/models/enums/ElementType';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import {
	describeRules as coreDescribeRules,
	subDescriptionParams,
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
		skills: dinoz.skills.map(s => ({ skillId: s.skillId })),
		status: dinoz.status.map(s => ({ statusId: s.statusId }))
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
	params: Record<string, unknown>;
};

type Translator = (key: string) => string;

/**
 * @summary Formats the raw params of the archetype texts (sub descriptions, rules, errors), same convention as the
 * backend `formatArchetypeParams`: race ids → names, element → `:fire:` icon, skill id → name.
 */
export function formatArchetypeParams(
	params: Record<string, unknown> | undefined,
	t: Translator,
	exists: (key: string) => boolean
): Record<string, unknown> {
	const raceName = (race: unknown) => t(raceNameKey(race as number));
	const formatted: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(params ?? {})) {
		switch (key) {
			case 'race':
				formatted[key] = raceName(value);
				break;
			case 'races':
			case 'forbidden':
			case 'required':
				formatted[key] = Array.isArray(value) ? value.map(raceName).join(', ') : value;
				break;
			case 'element':
				formatted[key] = `:${ElementNames[value as number]}:`;
				break;
			case 'skill': {
				const own = `tournament.archetype.skill.${value}`;
				const details = skillList[value as Skill];
				formatted[key] = exists(own) ? t(own) : details ? t(`skill.name.${details.name}`) : String(value);
				break;
			}
			case 'sizes':
				formatted[key] = Array.isArray(value) ? value.join(', ') : value;
				break;
			default:
				formatted[key] = value;
		}
	}
	return formatted;
}

/** @summary One line per rule present in `rules` (keys from core describeRules), with formatted params. */
export function describeRules(
	rules: TournamentRules | null | undefined,
	t: Translator,
	exists: (key: string) => boolean
): RuleLine[] {
	return coreDescribeRules(rules).map(rule => ({
		key: `tournament.archetype.rule.${rule.key}`,
		params: formatArchetypeParams(rule.params, t, exists)
	}));
}

/** @summary Formatted params of the description of the sub archetype of a tournament. */
export function describeSubParams(
	info: {
		metaArchetype?: string;
		formatName?: string;
		teamRace: number[];
		teamSize?: number;
		rules?: TournamentRules | null;
	},
	t: Translator,
	exists: (key: string) => boolean
): Record<string, unknown> {
	return formatArchetypeParams(
		subDescriptionParams({
			meta: info.metaArchetype ?? '',
			key: info.formatName ?? '',
			teamRace: info.teamRace as RaceEnum[],
			teamSize: info.teamSize,
			rules: info.rules ?? {}
		}),
		t,
		exists
	);
}
