import { describe, it, expect } from 'vitest';
import seedrandom from 'seedrandom';
import { getRandomInteger, getRandomNumber } from '../../utils/tools.js';

// A stand-in PRNG that always yields the same value, to pin down boundary behaviour.
const fixed = (value: number) => (() => value) as unknown as seedrandom.PRNG;

describe('getRandomInteger', () => {
	it('returns min when the generator yields 0', () => {
		expect(getRandomInteger(1, 10, fixed(0))).toBe(1);
	});

	it('returns max (inclusive) when the generator yields nearly 1', () => {
		expect(getRandomInteger(1, 10, fixed(0.999999))).toBe(10);
	});

	it('returns the single value when min === max', () => {
		expect(getRandomInteger(7, 7)).toBe(7);
	});

	it('throws a RangeError when min > max', () => {
		expect(() => getRandomInteger(10, 1)).toThrow(RangeError);
	});

	it('is reproducible for a given seed', () => {
		const a = getRandomInteger(0, 1000, seedrandom('dino'));
		const b = getRandomInteger(0, 1000, seedrandom('dino'));
		expect(a).toBe(b);
	});

	it('stays within [min, max] across many seeded draws', () => {
		const rng = seedrandom('bounds');
		for (let i = 0; i < 1000; i++) {
			const n = getRandomInteger(5, 9, rng);
			expect(n).toBeGreaterThanOrEqual(5);
			expect(n).toBeLessThanOrEqual(9);
		}
	});
});

describe('getRandomNumber', () => {
	it('returns min when the generator yields 0', () => {
		expect(getRandomNumber(2, 8, fixed(0))).toBe(2);
	});

	it('interpolates linearly between min and max', () => {
		expect(getRandomNumber(0, 10, fixed(0.5))).toBe(5);
	});

	it('returns the single value when min === max', () => {
		expect(getRandomNumber(3, 3)).toBe(3);
	});

	it('throws a RangeError when min > max', () => {
		expect(() => getRandomNumber(8, 2)).toThrow(RangeError);
	});
});
