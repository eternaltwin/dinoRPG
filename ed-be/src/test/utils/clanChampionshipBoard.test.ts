import { describe, it, expect } from 'vitest';
import seedrandom from 'seedrandom';
import {
	cellIndex,
	fightZone,
	generateObstacles,
	hasCrossingPath,
	isBehindAttack,
	pickEntryCell,
	scoreLine
} from '../../utils/clanChampionship/board.js';

describe('clanChampionship board rules', () => {
	it('scoreLine follows the spec example (0-based: A at 7 and 11, B at 9; 11 and 9 pass each other)', () => {
		const a = [
			{ id: 1, clanId: 1, x: 7, y: 3 },
			{ id: 2, clanId: 1, x: 11, y: 5 }
		];
		const b = [{ id: 3, clanId: 2, x: 9, y: 0 }];
		expect(scoreLine('west', a, b)).toBe(7);
		expect(scoreLine('east', b, a)).toBe(0); // crossing is mutual: 9 is passed by the west piece at 11
	});
	it('scoreLine: no crossing means both lines count', () => {
		const a = [{ id: 1, clanId: 1, x: 7, y: 3 }];
		const b = [
			{ id: 2, clanId: 2, x: 9, y: 0 },
			{ id: 3, clanId: 2, x: 12, y: 1 }
		];
		expect(scoreLine('west', a, b)).toBe(7);
		expect(scoreLine('east', b, a)).toBe(19 - 9);
	});
	it('scoreLine is 0 without pieces', () => expect(scoreLine('west', [], [])).toBe(0));
	it('east pieces are passed by west pieces with a greater x', () => {
		expect(scoreLine('east', [{ id: 1, clanId: 2, x: 5, y: 0 }], [{ id: 2, clanId: 1, x: 6, y: 9 }])).toBe(0);
	});
	it('obstacles are symmetric, off the entry columns, 10-15 % and crossable', () => {
		for (let seed = 0; seed < 50; seed++) {
			const obs = generateObstacles(seedrandom(String(seed)));
			const set = new Set(obs);
			obs.forEach(c => {
				const x = c % 20;
				const y = Math.floor(c / 20);
				expect(x).not.toBe(0);
				expect(x).not.toBe(19);
				expect(set.has(cellIndex(19 - x, 19 - y))).toBe(true);
			});
			expect(obs.length).toBeGreaterThanOrEqual(40);
			expect(obs.length).toBeLessThanOrEqual(60);
			expect(hasCrossingPath(obs)).toBe(true);
		}
	});
	it('hasCrossingPath is false when a full column is blocked', () => {
		expect(hasCrossingPath(Array.from({ length: 20 }, (_, y) => cellIndex(10, y)))).toBe(false);
	});
	it('isBehindAttack: west victim attacked from x-1, east victim from x+1', () => {
		expect(isBehindAttack('west', { x: 4 }, { x: 5 })).toBe(true);
		expect(isBehindAttack('west', { x: 6 }, { x: 5 })).toBe(false);
		expect(isBehindAttack('east', { x: 6 }, { x: 5 })).toBe(true);
		expect(isBehindAttack('east', { x: 5 }, { x: 5 })).toBe(false); // vertical attack
	});
	it('fightZone is 4x3 for a horizontal attack and 3x4 for a vertical one', () => {
		expect(fightZone({ x: 5, y: 5 }, { x: 6, y: 5 }).size).toBe(12);
		expect(fightZone({ x: 5, y: 5 }, { x: 5, y: 6 }).size).toBe(12);
		expect(fightZone({ x: 0, y: 0 }, { x: 1, y: 0 }).size).toBe(6); // clipped at the corner
	});
	it('pickEntryCell returns null when the entry column is full', () => {
		const full = new Set(Array.from({ length: 20 }, (_, y) => cellIndex(0, y)));
		expect(pickEntryCell('west', full, seedrandom('x'))).toBeNull();
	});
});
