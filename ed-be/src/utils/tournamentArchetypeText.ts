import { Lang } from '@drpg/prisma';
import { ArchetypeCandidate, subDescriptionParams, TournamentRules } from '@drpg/core/models/dojo/tournamentArchetypes';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { ElementNames } from '@drpg/core/models/enums/ElementType';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { translateTarget } from './server/translate.js';

/**
 * Texts of the tournament archetypes for the backend news (vote and tournament start).
 *
 * Archetype keys are provided by the catalogue (`tournament.archetype.meta.<key>.name`,
 * `tournament.archetype.sub.<key>.name|description`, `tournament.archetype.rule.<field>`). Every lookup falls back to
 * the raw key when the translation is missing, so a sub removed from the catalogue stays readable.
 *
 * Interpolation params given to the rule sentences `tournament.archetype.rule.<field>`:
 * - number rules (specialistPct, balancedPct, etherMin, levelBudgetPct, levelSpread): `value`;
 * - string rules (demon, summon): `value`, and `context` = value (so `rule.demon_only` can be used);
 * - elementMin: `element` (translated), `min`, `value` = min; elementDominant: `element`, `value`;
 * - skillRequired / skillForbidden: `skill` (translated), `value` = skill id;
 * - race lists (requireOneOf, forbiddenRaces): `races` (translated, comma separated), `count`;
 * - boolean rules: no param.
 */

const ALL_RACES = Object.values(RaceEnum).filter((r): r is RaceEnum => typeof r === 'number');

export function getAllRaces(): RaceEnum[] {
	return [...ALL_RACES];
}

/** Translates a key, or returns the fallback when the translation is missing (i18next returns the key). */
export function translateOr(key: string, lang: Lang, fallback: string, options?: Record<string, unknown>): string {
	const translation = translateTarget(key, lang, options);
	return !translation || translation === key ? fallback : translation;
}

export function translateRaces(races: number[], lang: Lang): string {
	return races.map(r => translateTarget(`race.${r}`, lang)).join(', ');
}

export function metaArchetypeName(meta: string, lang: Lang): string {
	return translateOr(`tournament.archetype.meta.${meta}.name`, lang, meta);
}

export function subArchetypeName(sub: string, lang: Lang): string {
	return translateOr(`tournament.archetype.sub.${sub}.name`, lang, sub);
}

export function subArchetypeDescription(sub: string, lang: Lang, params?: Record<string, unknown>): string {
	return translateOr(`tournament.archetype.sub.${sub}.description`, lang, '', {
		...params,
		interpolation: { escapeValue: false }
	});
}

/** Params of the description of a rolled sub, formatted for the language (races, element, skill names). */
export function subDescriptionTextParams(candidate: ArchetypeCandidate, lang: Lang): Record<string, unknown> {
	const formatted: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(subDescriptionParams(candidate))) {
		switch (key) {
			case 'races':
			case 'forbidden':
			case 'required':
				formatted[key] = translateRaces(value as number[], lang);
				break;
			case 'element':
				formatted[key] = elementName(value as number, lang);
				break;
			case 'skill':
				formatted[key] = skillName(value as number, lang);
				break;
			case 'sizes':
				formatted[key] = (value as number[]).join(', ');
				break;
			default:
				formatted[key] = value;
		}
	}
	return formatted;
}

/** "Meta — Sub", each part falling back to its raw key. */
export function archetypeName(meta: string, sub: string, lang: Lang): string {
	return `${metaArchetypeName(meta, lang)} — ${subArchetypeName(sub, lang)}`;
}

function elementName(element: number, lang: Lang): string {
	const name = ElementNames[element] ?? `${element}`;
	return translateOr(`tournament.archetype.element.${name}`, lang, name);
}

function skillName(skill: number, lang: Lang): string {
	return translateOr(`tournament.archetype.skill.${skill}`, lang, Skill[skill] ?? `${skill}`);
}

function ruleParams(field: string, value: unknown, lang: Lang): Record<string, unknown> {
	switch (field) {
		case 'elementMin': {
			const rule = value as NonNullable<TournamentRules['elementMin']>;
			return { element: elementName(rule.element, lang), min: rule.min, value: rule.min };
		}
		case 'elementDominant':
			return { element: elementName(value as number, lang), value };
		case 'skillRequired':
		case 'skillForbidden':
			return { skill: skillName(value as number, lang), value };
		default:
			break;
	}
	if (Array.isArray(value)) {
		return { races: translateRaces(value as number[], lang), count: value.length };
	}
	if (typeof value === 'string') {
		return { value, context: value };
	}
	if (typeof value === 'number') {
		return { value };
	}
	return {};
}

/** One sentence per rule set in `rules`. Unset or false rules are skipped. */
export function describeRules(rules: TournamentRules | null | undefined, lang: Lang): string[] {
	if (!rules) return [];
	const sentences: string[] = [];
	for (const [field, value] of Object.entries(rules)) {
		if (value === undefined || value === null || value === false) continue;
		const key = `tournament.archetype.rule.${field}`;
		sentences.push(
			translateOr(key, lang, `${field}: ${JSON.stringify(value)}`, {
				...ruleParams(field, value, lang),
				interpolation: { escapeValue: false }
			})
		);
	}
	return sentences;
}

/**
 * Renders a candidate of the vote (markdown): name, description, rules, and the races / team size it imposes.
 * The common parameters (level limit, poison, free team size) are drawn at the creation and not described here.
 */
export function describeCandidate(candidate: ArchetypeCandidate, lang: Lang): string {
	const lines = [`**${archetypeName(candidate.meta, candidate.key, lang)}**`];
	const description = subArchetypeDescription(candidate.key, lang, subDescriptionTextParams(candidate, lang));
	if (description) lines.push(description);

	const details = describeRules(candidate.rules, lang);
	if (candidate.teamRace.length > 0 && candidate.teamRace.length < ALL_RACES.length) {
		details.push(
			translateTarget('dojo.raceLimit', lang, {
				races: candidate.teamRace.map(r => ' ' + translateTarget(`race.${r}`, lang)),
				interpolation: { escapeValue: false }
			})
		);
	}
	if (candidate.teamSize) {
		details.push(translateTarget('tournament.vote.teamSize', lang, { nb: candidate.teamSize }));
	} else if (candidate.teamSizes && candidate.teamSizes.length > 0) {
		details.push(translateTarget('tournament.vote.teamSizes', lang, { sizes: candidate.teamSizes.join(' / ') }));
	}
	if (candidate.raceMinimum) {
		details.push(translateTarget('tournament.vote.raceMinimum', lang, { races: candidate.raceMinimum }));
	}
	lines.push(...details.map(d => `- ${d}`));
	return lines.join('\n');
}
