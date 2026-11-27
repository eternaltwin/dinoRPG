import { describe, expect, it } from 'vitest';
import { computeQualifGain, getFeaturedRaceOfDay, QualifGainInput } from '@drpg/core/utils/dojoQualif';

const win = (input: Partial<QualifGainInput> = {}): QualifGainInput => ({
	victory: true,
	challengeWon: false,
	attackerLevel: 20,
	attackerRaceId: 1,
	targetLevel: 20,
	targetRaceId: 2,
	featuredRace: null,
	...input
});

describe('computeQualifGain', () => {
	it('gives the victory points against a dinoz of the same level', () => {
		expect(computeQualifGain(win())).toEqual({ base: 4, levelBonus: 0, featuredMultiplier: 1, total: 4 });
	});
	it('adds the challenge points', () => {
		expect(computeQualifGain(win({ challengeWon: true })).total).toBe(8);
	});
	it('gives no level bonus under 5 levels of gap', () => {
		expect(computeQualifGain(win({ targetLevel: 24 })).levelBonus).toBe(0);
	});
	it('gives one point from 5 levels of gap', () => {
		const gain = computeQualifGain(win({ targetLevel: 25 }));
		expect(gain.levelBonus).toBe(1);
		expect(gain.total).toBe(5);
	});
	it('gives 2 points for 12 levels of gap', () => {
		expect(computeQualifGain(win({ targetLevel: 32 })).levelBonus).toBe(2);
	});
	it('gives no level bonus against a weaker target', () => {
		expect(computeQualifGain(win({ targetLevel: 5 })).levelBonus).toBe(0);
	});
	it('applies ×1.5 when one side is of the race of the day', () => {
		expect(computeQualifGain(win({ featuredRace: 1 })).total).toBe(6);
		expect(computeQualifGain(win({ featuredRace: 2 })).total).toBe(6);
	});
	it('applies ×2 when both sides are of the race of the day', () => {
		const gain = computeQualifGain(win({ featuredRace: 1, targetRaceId: 1, challengeWon: true, targetLevel: 30 }));
		expect(gain.featuredMultiplier).toBe(2);
		expect(gain.total).toBe(20);
	});
	it('gives nothing on a defeat', () => {
		expect(
			computeQualifGain(win({ victory: false, challengeWon: true, targetLevel: 40, featuredRace: 1, targetRaceId: 1 }))
		).toEqual({ base: 0, levelBonus: 0, featuredMultiplier: 1, total: 0 });
	});
});

describe('getFeaturedRaceOfDay', () => {
	const races = [1, 2, 3, 4, 5, 6, 7];
	const start = new Date(2026, 10, 23, 0, 0);
	it('returns the race of each qualification day', () => {
		expect(getFeaturedRaceOfDay(races, start, new Date(2026, 10, 23, 18, 0))).toBe(1);
		expect(getFeaturedRaceOfDay(races, start, new Date(2026, 10, 29, 23, 59))).toBe(7);
	});
	it('returns null before the qualification', () => {
		expect(getFeaturedRaceOfDay(races, start, new Date(2026, 10, 22, 12, 0))).toBeNull();
	});
	it('returns null after the seventh day', () => {
		expect(getFeaturedRaceOfDay(races, start, new Date(2026, 10, 30, 12, 0))).toBeNull();
	});
	it('returns null when no race was drawn', () => {
		expect(getFeaturedRaceOfDay([], start, new Date(2026, 10, 24, 12, 0))).toBeNull();
	});
});
