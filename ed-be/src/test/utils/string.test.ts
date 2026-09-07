import { describe, it, expect } from 'vitest';
import { removeIcons, normalizeSpaces } from '../../utils/string.js';

describe('normalizeSpaces', () => {
	it('full spaces', () => {
		expect(normalizeSpaces('      ')).toBe(' ');
	});
	it('multiple spaces', () => {
		expect(normalizeSpaces('This    is   a test')).toBe('This is a test');
	});
	it('spaces before a comma or dot', () => {
		expect(normalizeSpaces('Buy an epic box , a rare box and a common box .')).toBe(
			'Buy an epic box, a rare box and a common box.'
		);
	});
	it('no spaces', () => {
		expect(normalizeSpaces('test\n')).toBe('test\n');
	});
});

describe('removeIcons', () => {
	it('text with icons', () => {
		expect(removeIcons('500 points: 900 :gold: and 2 boxes :item_9:')).toBe('500 points: 900 and 2 boxes');
	});
	it('text without icons', () => {
		const text = '500 points: 600 points: test';
		expect(removeIcons(text)).toBe(text);
	});
});
