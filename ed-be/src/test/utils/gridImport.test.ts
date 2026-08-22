import { describe, it, expect } from 'vitest';
import { checkScenarios, structFromGrid } from '../../business/dungeon/gridImport.js';
import { Item } from '@drpg/core/models/item/ItemList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { DungeonCodec } from '../../business/dungeon/DungeonCodec.js';
import type { DungeonGrid } from '@drpg/core/models/dungeon/DungeonEditor';

/** 16×16, all floor, easy to poke holes into. */
function blankGrid(levels = 2): DungeonGrid {
	return {
		width: 16,
		height: 16,
		levels: Array.from({ length: levels }, () => ({
			floor: Array.from({ length: 16 }, () => '1'.repeat(16)),
			doors: [],
			items: []
		})),
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 14, y: 14, l: levels - 1 }
	};
}

describe('structFromGrid', () => {
	it('round-trips a grid with stairs, monster, locked door and items through the codec', () => {
		const g = blankGrid(2);
		g.levels[0].floor[5] = '1'.repeat(4) + '0'.repeat(8) + '1'.repeat(4); // carve some wall
		g.levels[0].doors = [
			{ x: 8, y: 8, up: true, key: null }, // stair up…
			{ x: 3, y: 3, up: null, key: null }, // monster spot
			{ x: 6, y: 2, up: null, key: 7 } // locked door
		];
		g.levels[1].doors = [{ x: 8, y: 8, up: false, key: null }]; // …paired stair down
		g.levels[0].items = [
			{ x: 10, y: 2, k: 0, v: 7 }, // key — same chunk as the gold below
			{ x: 12, y: 2, k: 1, v: 50 } // gold
		];
		g.levels[1].items = [{ x: 4, y: 4, k: 3, v: 0 }]; // scenario

		const d = structFromGrid(g);
		const encoded = new DungeonCodec().encode(d);
		const codec = new DungeonCodec();
		expect(codec.decode(encoded)).toBe(true);
		const r = codec.d;

		expect(r.width).toBe(16);
		expect(r.levels.length).toBe(2);
		expect(r.start).toEqual({ x: 1, y: 1, l: 0 });
		expect(r.exit).toEqual({ x: 14, y: 14, l: 1 });
		// Floor tables survive exactly (wall row included).
		for (let l = 0; l < 2; l++) {
			for (let x = 0; x < 16; x++) {
				for (let y = 0; y < 16; y++) {
					expect(r.levels[l].table[x][y]).toBe(g.levels[l].floor[y][x] === '1');
				}
			}
		}
		// Every door and item is present at its cell with the right payload.
		const doors = (l: number) => r.levels[l].rooms.flatMap(room => room.doors);
		expect(doors(0)).toEqual(
			expect.arrayContaining([
				{ x: 8, y: 8, up: true, key: null },
				{ x: 3, y: 3, up: null, key: null },
				{ x: 6, y: 2, up: null, key: 7 }
			])
		);
		expect(doors(0)).toHaveLength(3);
		expect(doors(1)).toEqual([{ x: 8, y: 8, up: false, key: null }]);
		const items = (l: number) => r.levels[l].rooms.map(room => room.item).filter(i => i != null);
		expect(items(0)).toEqual(
			expect.arrayContaining([
				{ x: 10, y: 2, k: 0, v: 7 },
				{ x: 12, y: 2, k: 1, v: 50 }
			])
		);
		expect(items(1)).toEqual([{ x: 4, y: 4, k: 3, v: 0 }]);
	});

	it('rejects a door on a wall cell', () => {
		const g = blankGrid(1);
		g.levels[0].floor[0] = '0'.repeat(16);
		g.levels[0].doors = [{ x: 5, y: 0, up: null, key: null }];
		expect(() => structFromGrid(g)).toThrow(/not on a floor cell/);
	});

	it('rejects a key index above 63', () => {
		const g = blankGrid(1);
		g.levels[0].doors = [{ x: 5, y: 5, up: null, key: 64 }];
		expect(() => structFromGrid(g)).toThrow(/door key/);
	});

	it('rejects a stair up on the top floor', () => {
		const g = blankGrid(1);
		g.levels[0].doors = [{ x: 5, y: 5, up: true, key: null }];
		expect(() => structFromGrid(g)).toThrow(/no level above/);
	});

	it('rejects two entities on the same cell', () => {
		const g = blankGrid(1);
		g.levels[0].doors = [{ x: 5, y: 5, up: null, key: null }];
		g.levels[0].items = [{ x: 5, y: 5, k: 1, v: 10 }];
		expect(() => structFromGrid(g)).toThrow(/overlaps/);
	});
});

describe('checkScenarios', () => {
	it('keeps valid entries and trims the text', () => {
		expect(
			checkScenarios([
				{ text: ' Un coffre ! ', icon: 'chest', obj: Item.POTION_IRMA, count: 3 },
				{ text: 'Un parchemin', icon: 'scroll', collec: Reward.DEMON }
			])
		).toEqual([
			{ text: 'Un coffre !', icon: 'chest', obj: Item.POTION_IRMA, count: 3, collec: undefined, raw: true },
			{ text: 'Un parchemin', icon: 'scroll', obj: undefined, count: undefined, collec: Reward.DEMON, raw: true }
		]);
	});

	it('rejects an empty text, an unknown item and a bad icon', () => {
		expect(() => checkScenarios([{ text: '  ' }])).toThrow(/needs a text/);
		expect(() => checkScenarios([{ text: 'ok', obj: 999999 }])).toThrow(/unknown item/);
		expect(() => checkScenarios([{ text: 'ok', icon: 'skel' }])).toThrow(/icon/);
	});
});
