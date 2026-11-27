import dayjs from 'dayjs';
import {
	DOJO_FEATURED_BONUS,
	DOJO_LEVEL_GAP_STEP,
	DOJO_QUALIFICATION_DAYS,
	DOJO_REPUTATION_CHALLENGE,
	DOJO_REPUTATION_WIN
} from './dojoConstants.mjs';

export type QualifGainInput = {
	victory: boolean;
	challengeWon: boolean;
	attackerLevel: number;
	attackerRaceId: number;
	targetLevel: number;
	targetRaceId: number;
	featuredRace: number | null;
};

export type QualifGain = {
	/** Points of the victory and of the challenge */
	base: number;
	/** Extra points earned by beating a stronger dinoz */
	levelBonus: number;
	/** Multiplier from the race of the day: 1, 1.5 or 2 */
	featuredMultiplier: number;
	/** Reputation actually earned */
	total: number;
};

/**
 * @summary Reputation earned by a qualification fight.
 * gain = round((win + challenge + levelBonus) × (1 + 0.5·attacker featured + 0.5·target featured)), only on a victory.
 */
export function computeQualifGain(input: QualifGainInput): QualifGain {
	if (!input.victory) {
		return { base: 0, levelBonus: 0, featuredMultiplier: 1, total: 0 };
	}
	const base = DOJO_REPUTATION_WIN + (input.challengeWon ? DOJO_REPUTATION_CHALLENGE : 0);
	const levelBonus = Math.max(0, Math.floor((input.targetLevel - input.attackerLevel) / DOJO_LEVEL_GAP_STEP));
	let featuredMultiplier = 1;
	if (input.featuredRace !== null) {
		if (input.attackerRaceId === input.featuredRace) featuredMultiplier += DOJO_FEATURED_BONUS;
		if (input.targetRaceId === input.featuredRace) featuredMultiplier += DOJO_FEATURED_BONUS;
	}
	return {
		base,
		levelBonus,
		featuredMultiplier,
		total: Math.round((base + levelBonus) * featuredMultiplier)
	};
}

/**
 * @summary Race of the day of the qualification, null outside of the qualification days or when none was drawn.
 */
export function getFeaturedRaceOfDay(
	featuredRaces: number[] | null | undefined,
	qualificationStart: Date,
	now: Date = new Date()
) {
	const day = dayjs(now).startOf('day').diff(dayjs(qualificationStart).startOf('day'), 'day');
	if (day < 0 || day >= DOJO_QUALIFICATION_DAYS) return null;
	return featuredRaces?.[day] ?? null;
}
