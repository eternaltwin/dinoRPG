import { describe, it, expect } from 'vitest';
import { OriginalGenerator } from '../../business/dungeon/original/index.js';
import { DungeonItem } from '../../business/dungeon/types.js';

describe('dungeon lock-and-key generation', () => {
	it('pairs every locked door with exactly one key, and vice versa', () => {
		for (let seed = 1; seed <= 5; seed++) {
			const d = OriginalGenerator.generate({ seed });
			const doorKeys: number[] = [];
			const itemKeys: number[] = [];
			for (const lvl of d.levels)
				for (const room of lvl.rooms) {
					for (const door of room.doors) if (door.key != null) doorKeys.push(door.key);
					if (room.item?.k === DungeonItem.IKey) itemKeys.push(room.item.v);
				}
			expect(doorKeys.length).toBeGreaterThan(0);
			// 1:1 — no shared ids on either side, and the two sets are identical.
			expect(new Set(doorKeys).size).toBe(doorKeys.length);
			expect(new Set(itemKeys).size).toBe(itemKeys.length);
			expect([...doorKeys].sort()).toEqual([...itemKeys].sort());
			// DungeonCodec stores key ids in 6 bits.
			for (const k of doorKeys) expect(k).toBeLessThanOrEqual(63);
		}
	});
});
