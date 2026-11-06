import { describe, it, expect } from 'vitest';
import { applyGoldDiminishing } from '@drpg/core/utils/fightGold';

const CURVE = { start: 400_000, end: 500_000, floorRate: 0.1 };

describe('applyGoldDiminishing', () => {
	it('pays everything below the start of the curve', () => {
		expect(applyGoldDiminishing(0, 1_000, CURVE)).toBe(1_000);
		expect(applyGoldDiminishing(399_000, 1_000, CURVE)).toBe(1_000);
	});

	it('pays 55 000 for the whole slope, so 455 000 for the first 500 000', () => {
		expect(applyGoldDiminishing(400_000, 100_000, CURVE)).toBe(55_000);
		expect(applyGoldDiminishing(0, 500_000, CURVE)).toBe(455_000);
	});

	it('lowers the rate along the slope', () => {
		// Middle of the slope: the rate is 55 %.
		expect(applyGoldDiminishing(449_500, 1_000, CURVE)).toBe(550);
	});

	it('splits a gain across the start of the curve', () => {
		// 1 000 at full rate, then 995.5 at the top of the slope.
		expect(Math.abs(applyGoldDiminishing(399_000, 2_000, CURVE) - 1_995.5)).toBeLessThanOrEqual(0.5);
	});

	it('splits a gain across the end of the curve', () => {
		// 104.5 at the bottom of the slope, then 100 at the floor rate.
		expect(Math.abs(applyGoldDiminishing(499_000, 2_000, CURVE) - 204.5)).toBeLessThanOrEqual(0.5);
	});

	it('pays the floor rate past the end of the curve', () => {
		expect(applyGoldDiminishing(500_000, 1_000, CURVE)).toBe(100);
		expect(applyGoldDiminishing(9_000_000, 1_234, CURVE)).toBe(123);
	});

	it('gives about the same total whether the gains are split or not', () => {
		let earned = 0;
		let paid = 0;
		for (let i = 0; i < 700; i++) {
			paid += applyGoldDiminishing(earned, 1_000, CURVE);
			earned += 1_000;
		}
		expect(Math.abs(paid - applyGoldDiminishing(0, 700_000, CURVE))).toBeLessThanOrEqual(350);
	});

	it('pays nothing for a gain of zero or less', () => {
		expect(applyGoldDiminishing(450_000, 0, CURVE)).toBe(0);
		expect(applyGoldDiminishing(450_000, -5, CURVE)).toBe(0);
	});
});
