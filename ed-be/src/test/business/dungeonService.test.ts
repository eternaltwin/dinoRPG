import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomBytes } from 'crypto';

vi.mock('../../dao/dungeonRunDao.js', () => ({
	createRun: vi.fn(),
	findRun: vi.fn(),
	updateRun: vi.fn()
}));

import { createRun, findRun, updateRun } from '../../dao/dungeonRunDao.js';
import { startRun, move } from '../../business/dungeonService.js';
import { OriginalGenerator } from '../../business/dungeon/original/index.js';
import { DungeonCodec } from '../../business/dungeon/DungeonCodec.js';
import { findPath } from '../../business/dungeon/pathfind.js';
import { seal } from '../../utils/dungeonCrypto.js';
import type { DungeonStruct } from '../../business/dungeon/types.js';

process.env.DUNGEON_KEY = randomBytes(32).toString('hex');

/** A stored run row for `d`, dinoz at the start, nothing revealed yet. */
function rowFor(d: DungeonStruct) {
	const sealed = seal(new DungeonCodec().encode(d));
	return {
		id: 'run1',
		cipher: sealed.cipher,
		iv: sealed.iv,
		tag: sealed.tag,
		posX: d.start.x,
		posY: d.start.y,
		posL: d.start.l,
		revealed: '[]',
		createdAt: new Date()
	};
}

describe('dungeonService — fog-of-war boundary', () => {
	const d = OriginalGenerator.generate({ seed: 7, width: 24, height: 24, levels: 2 });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('startRun never returns the layout, only the entrance reveal', async () => {
		vi.mocked(createRun).mockResolvedValue(rowFor(d) as never);
		const r = await startRun();
		// at most the entered cell + 4 neighbours
		expect(r.reveal.length).toBeGreaterThan(0);
		expect(r.reveal.length).toBeLessThanOrEqual(5);
		// no table / encoded string anywhere in the payload
		expect(JSON.stringify(r)).not.toContain('table');
		expect(JSON.stringify(r)).not.toContain('[[');
		// what hit the DB is ciphertext, not the encoded string
		const stored = vi.mocked(createRun).mock.calls[0][0];
		expect(stored.cipher.toString('utf8')).not.toContain(']]');
	});

	it('rejects a step into a wall and reveals nothing', async () => {
		vi.mocked(findRun).mockResolvedValue(rowFor(d) as never);
		const t = d.levels[d.start.l].table;
		// find a wall neighbour of the start cell (the generator always has one)
		const dirs: [number, number][] = [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		];
		const wallDir = dirs.find(([dx, dy]) => !(t[d.start.x + dx]?.[d.start.y + dy] ?? false));
		expect(wallDir).toBeDefined();
		const r = await move('run1', wallDir![0], wallDir![1], 0);
		expect(r.ok).toBe(false);
		expect(r.reveal).toEqual([]);
		expect(r.pos).toEqual({ l: d.start.l, x: d.start.x, y: d.start.y });
		expect(updateRun).not.toHaveBeenCalled();
	});

	it('accepts a step onto floor and reveals only new cells', async () => {
		vi.mocked(findRun).mockResolvedValue(rowFor(d) as never);
		vi.mocked(updateRun).mockResolvedValue({} as never);
		const t = d.levels[d.start.l].table;
		const dirs: [number, number][] = [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		];
		const floorDir = dirs.find(([dx, dy]) => t[d.start.x + dx]?.[d.start.y + dy] === true);
		expect(floorDir).toBeDefined();
		const r = await move('run1', floorDir![0], floorDir![1], 0);
		expect(r.ok).toBe(true);
		expect(r.pos).toEqual({ l: d.start.l, x: d.start.x + floorDir![0], y: d.start.y + floorDir![1] });
		expect(r.reveal.length).toBeLessThanOrEqual(5);
		expect(updateRun).toHaveBeenCalledOnce();
	});

	it('rejects diagonal and multi-cell steps', async () => {
		vi.mocked(findRun).mockResolvedValue(rowFor(d) as never);
		expect((await move('run1', 1, 1, 0)).ok).toBe(false);
		expect((await move('run1', 0, 0, 0)).ok).toBe(false);
	});

	it('rejects a stair step when not on a stair cell', async () => {
		// The generator never puts a stair on the start cell.
		vi.mocked(findRun).mockResolvedValue(rowFor(d) as never);
		const r = await move('run1', 0, 0, 1);
		expect(r.ok).toBe(false);
	});
});

describe('dungeon pipeline (ported from maze-poc)', () => {
	it('encode/decode round-trip is stable', () => {
		for (let seed = 1; seed <= 12; seed++) {
			const d = OriginalGenerator.generate({ seed, width: 24, height: 24, levels: 3 });
			const s1 = new DungeonCodec().encode(d);
			const dec = new DungeonCodec();
			expect(dec.decode(s1), `seed ${seed}: CRC failed`).toBe(true);
			expect(new DungeonCodec().encode(dec.d), `seed ${seed}: re-encode differs`).toBe(s1);
		}
	});

	it('generated dungeons are solvable start -> exit', () => {
		for (let seed = 1; seed <= 12; seed++) {
			const d = OriginalGenerator.generate({ seed, width: 24, height: 24, levels: 3 });
			const path = findPath(d, { ...d.start }, { ...d.exit });
			expect(path, `seed ${seed}: exit unreachable`).not.toBeNull();
			expect(path![0]).toEqual({ l: d.start.l, x: d.start.x, y: d.start.y });
			expect(path![path!.length - 1]).toEqual({ l: d.exit.l, x: d.exit.x, y: d.exit.y });
		}
	});
});
