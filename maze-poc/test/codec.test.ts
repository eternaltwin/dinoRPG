/**
 * Pure-logic sanity checks (no DOM / no Pixi). Run with `yarn test`.
 *
 * Verifies that BitCodec round-trips, that DungeonCodec encode/decode is stable,
 * and that every generated dungeon is solvable from start to exit.
 */

import assert from 'node:assert/strict';
import { BitCodec } from '../src/dungeon/BitCodec';
import { DungeonCodec } from '../src/dungeon/DungeonCodec';
import { OriginalGenerator } from '../src/dungeon/original';
import { findPath } from './pathfind';
import type { DungeonStruct } from '../src/dungeon/types';

let passed = 0;
function check(name: string, fn: () => void): void {
	fn();
	passed++;
	console.log(`  ok  ${name}`);
}

// ── BitCodec ─────────────────────────────────────────────────────────────────
check('BitCodec round-trips arbitrary bit widths', () => {
	const w = new BitCodec(null);
	const samples: [number, number][] = [];
	let rnd = 123456789;
	for (let i = 0; i < 2000; i++) {
		rnd = (Math.imul(rnd, 1103515245) + 12345) >>> 0;
		const nbits = 1 + (rnd % 16);
		const value = rnd & ((1 << nbits) - 1);
		samples.push([nbits, value]);
		w.write(nbits, value);
	}
	const r = new BitCodec(w.toString());
	for (const [nbits, value] of samples) assert.equal(r.read(nbits), value);
});

// ── DungeonCodec + generator ─────────────────────────────────────────────────
function assertStructEqual(a: DungeonStruct, b: DungeonStruct): void {
	assert.equal(a.width, b.width);
	assert.equal(a.height, b.height);
	assert.equal(a.levels.length, b.levels.length);
	assert.deepEqual(a.start, b.start);
	assert.deepEqual(a.exit, b.exit);
	for (let l = 0; l < a.levels.length; l++) {
		assert.equal(a.levels[l].rooms.length, b.levels[l].rooms.length);
		for (let x = 0; x < a.width; x++)
			for (let y = 0; y < a.height; y++)
				assert.equal(
					a.levels[l].table[x][y] ?? false,
					b.levels[l].table[x][y] ?? false,
					`table mismatch at l${l} ${x},${y}`
				);
	}
}

check('DungeonCodec encode/decode is stable across 40 seeds', () => {
	for (let seed = 1; seed <= 40; seed++) {
		const levels = 1 + (seed % 3);
		const original = OriginalGenerator.generate({ seed, width: 24, height: 24, levels });

		const codec = new DungeonCodec();
		const s1 = codec.encode(original);

		const decoder = new DungeonCodec();
		assert.equal(decoder.decode(s1), true, `seed ${seed}: CRC failed`);

		// The decoded struct re-encodes to the exact same string.
		const s2 = new DungeonCodec().encode(decoder.d);
		assert.equal(s1, s2, `seed ${seed}: re-encode differs`);

		assertStructEqual(original, decoder.d);
	}
});

check('every generated dungeon is solvable (start -> exit)', () => {
	for (let seed = 1; seed <= 40; seed++) {
		const levels = 1 + (seed % 3);
		const d = OriginalGenerator.generate({ seed, width: 24, height: 24, levels });
		const path = findPath(d, { ...d.start }, { ...d.exit });
		assert.ok(path && path.length > 0, `seed ${seed}: exit unreachable`);
		assert.deepEqual(path![0], { l: d.start.l, x: d.start.x, y: d.start.y });
		assert.deepEqual(path![path!.length - 1], { l: d.exit.l, x: d.exit.x, y: d.exit.y });
	}
});

check('signature reports the right counts', () => {
	const d = OriginalGenerator.generate({ seed: 7, width: 24, height: 24, levels: 2 });
	const s = new DungeonCodec().encode(d);
	const sig = s.slice(2, s.indexOf(']]'));
	const rooms = d.levels.reduce((n, l) => n + l.rooms.length, 0);
	assert.match(sig, new RegExp(`${d.width}x${d.height}x${d.levels.length} ${rooms}R`));
});

console.log(`\n${passed} test group(s) passed.`);
