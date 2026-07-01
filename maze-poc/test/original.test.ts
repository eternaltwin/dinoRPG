/**
 * Tests for the ported original generator (gfx/dungeon/gen).
 * Verifies it produces dungeons that encode/decode stably and stay solvable.
 */

import assert from 'node:assert/strict';
import { OriginalGenerator } from '../src/dungeon/original';
import { DungeonCodec } from '../src/dungeon/DungeonCodec';
import { findPath } from './pathfind';
import { DungeonItem } from '../src/dungeon/types';

let passed = 0;
function check(name: string, fn: () => void): void {
	fn();
	passed++;
	console.log(`  ok  ${name}`);
}

check('original generator: encode/decode round-trip is stable', () => {
	for (let seed = 1; seed <= 12; seed++) {
		const d = OriginalGenerator.generate({ seed, width: 24, height: 24, levels: 3 });
		const s1 = new DungeonCodec().encode(d);
		const dec = new DungeonCodec();
		assert.equal(dec.decode(s1), true, `seed ${seed}: CRC failed`);
		const s2 = new DungeonCodec().encode(dec.d);
		assert.equal(s1, s2, `seed ${seed}: re-encode differs`);
	}
});

check('original generator: dungeons are solvable start -> exit', () => {
	for (let seed = 1; seed <= 12; seed++) {
		const d = OriginalGenerator.generate({ seed, width: 24, height: 24, levels: 3 });
		const path = findPath(d, { ...d.start }, { ...d.exit });
		assert.ok(path && path.length > 0, `seed ${seed}: exit unreachable`);
		assert.deepEqual(path![0], { l: d.start.l, x: d.start.x, y: d.start.y });
		assert.deepEqual(path![path!.length - 1], { l: d.exit.l, x: d.exit.x, y: d.exit.y });
	}
});

check('original generator: places keys and at least one locked door', () => {
	const d = OriginalGenerator.generate({ seed: 3, width: 24, height: 24, levels: 4 });
	let keys = 0;
	let locked = 0;
	let stairs = 0;
	for (const l of d.levels)
		for (const r of l.rooms) {
			if (r.item && r.item.k === DungeonItem.IKey) keys++;
			for (const door of r.doors) {
				if (door.key != null) locked++;
				if (door.up != null) stairs++;
			}
		}
	assert.ok(keys > 0, 'expected at least one key');
	assert.ok(locked > 0, 'expected at least one locked door');
	assert.ok(stairs > 0, 'expected stairs between levels');
});

console.log(`\n${passed} test group(s) passed.`);
