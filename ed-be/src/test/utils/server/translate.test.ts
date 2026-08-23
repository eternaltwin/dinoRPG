import { describe, it, expect } from 'vitest';
import { pluralize } from '../../../utils/server/translate.js';

describe('pluralize', () => {
	it('no parts', () => {
		const translation = 'Test';
		const result = pluralize(translation, 2);
		expect(result).toBe(translation);
	});
	it('two parts, single item', () => {
		const result = pluralize('An item | Many items', 1);
		expect(result).toBe('An item');
	});
	it('two parts, many items', () => {
		const result = pluralize('An item | Many items', 2);
		expect(result).toBe('Many items');
	});
	it('three parts, no items', () => {
		const result = pluralize('No items | An item | Many items', 0);
		expect(result).toBe('No items');
	});
	it('three parts, single item', () => {
		const result = pluralize('No items | An item | Many items', 1);
		expect(result).toBe('An item');
	});
	it('three parts, many items', () => {
		const result = pluralize('No items | An item | Many items', 2);
		expect(result).toBe('Many items');
	});
	it('too many parts', () => {
		const translation = 'No items | An item | Many items | Error';
		const result = pluralize(translation, 2);
		expect(result).toBe(translation);
	});
});
