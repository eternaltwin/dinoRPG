import { describe, expect, it } from 'vitest';
import { calculatePvPxp } from '@drpg/core/utils/DinozUtils';
import { computePvpXp } from '../../utils/fight/pvpXp.js';

describe('computePvpXp', () => {
	it('equals calculatePvPxp for one equal full-life opponent and a team of one', () => {
		const xp = computePvpXp({ level: 10 }, [{ level: 10, life: 50, maxLife: 50, escaped: false }], 10);
		expect(xp).toBeCloseTo(calculatePvPxp(10, 10));
	});

	it('ignores escaped opponents', () => {
		expect(computePvpXp({ level: 10 }, [{ level: 10, life: 50, maxLife: 50, escaped: true }], 10)).toBe(0);
	});

	it('reduces xp against a lower level, a wounded opponent and a bigger team', () => {
		const xp = computePvpXp({ level: 10 }, [{ level: 6, life: 25, maxLife: 50, escaped: false }], 20);
		expect(xp).toBeCloseTo(calculatePvPxp(6, 10) * (4 / 8) * 0.5 * 0.5);
	});
});
