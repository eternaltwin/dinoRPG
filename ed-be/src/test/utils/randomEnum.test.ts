import { describe, it, expect } from 'vitest';
import { getRandomEnumValue } from '../../utils/randomEnum.js';

// String enums have no reverse mapping, so `Object.values` yields exactly the declared values.
enum Color {
	RED = 'red',
	GREEN = 'green',
	BLUE = 'blue'
}

describe('getRandomEnumValue', () => {
	it('returns the first value when the random is 0', () => {
		expect(getRandomEnumValue(Color, 0)).toBe(Color.RED);
	});

	it('returns the last value when the random is just under 1', () => {
		expect(getRandomEnumValue(Color, 0.999)).toBe(Color.BLUE);
	});

	it('maps the random onto the matching bucket', () => {
		// floor(0.5 * 3) === 1 -> the middle value.
		expect(getRandomEnumValue(Color, 0.5)).toBe(Color.GREEN);
	});

	it('works on a plain value object', () => {
		// floor(0.6 * 2) === 1 -> the second value.
		expect(getRandomEnumValue({ a: 10, b: 20 }, 0.6)).toBe(20);
	});
});
