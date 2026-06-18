import { describe, it, expect, vi, afterEach } from 'vitest';
import weightedRandom from '../../../utils/fight/weightedRandom.js';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('weightedRandom', () => {
	it('returns the first item when every weight is zero', () => {
		const items = [
			{ id: 'a', odds: 0 },
			{ id: 'b', odds: 0 }
		];
		expect(weightedRandom(items)).toBe(items[0]);
	});

	it('picks the lower bucket when the draw lands inside it', () => {
		// Two equal buckets -> cumulative weights [0.5, 1]. A draw of 0 falls in the first.
		vi.spyOn(Math, 'random').mockReturnValue(0);
		const items = [
			{ id: 'a', odds: 1 },
			{ id: 'b', odds: 1 }
		];
		expect(weightedRandom(items)).toBe(items[0]);
	});

	it('picks the higher bucket when the draw lands inside it', () => {
		// draw 0.6 * total(1) = 0.6 > 0.5 -> second bucket.
		vi.spyOn(Math, 'random').mockReturnValue(0.6);
		const items = [
			{ id: 'a', odds: 1 },
			{ id: 'b', odds: 1 }
		];
		expect(weightedRandom(items)).toBe(items[1]);
	});

	it('honours uneven weighting', () => {
		const items = [
			{ id: 'common', odds: 9 },
			{ id: 'rare', odds: 1 }
		];
		// Cumulative weights [0.9, 1].
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
		expect(weightedRandom(items)).toBe(items[0]);
		vi.spyOn(Math, 'random').mockReturnValue(0.95);
		expect(weightedRandom(items)).toBe(items[1]);
	});
});
