import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomBytes } from 'crypto';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/dungeonRunDao.js', () => ({
	createRun: vi.fn(),
	findRun: vi.fn(),
	updateRun: vi.fn(),
	getDungeonByName: vi.fn(),
	getDungeonById: vi.fn(),
	dinozEnterRun: vi.fn(),
	dinozExitRun: vi.fn(),
	updateRunDefeated: vi.fn()
}));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), addMoney: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozFicheLiteRequest: vi.fn(),
	getDinozFightDataRequest: vi.fn(),
	getFollowingDinoz: vi.fn(),
	getLeaderWithFollowers: vi.fn(),
	updateDinoz: vi.fn(),
	updateMultipleDinoz: vi.fn()
}));

import { createRun, findRun, updateRun, getDungeonByName } from '../../dao/dungeonRunDao.js';
import { auth } from '../../dao/playerDao.js';
import { getFollowingDinoz } from '../../dao/dinozDao.js';
import { startRun, move } from '../../business/dungeonService.js';
import { OriginalGenerator } from '../../business/dungeon/original/index.js';
import { DungeonCodec } from '../../business/dungeon/DungeonCodec.js';
import { findPath } from '../../business/dungeon/pathfind.js';
import { seal } from '../../utils/dungeonCrypto.js';
import type { DungeonStruct } from '../../business/dungeon/types.js';

process.env.DUNGEON_KEY = randomBytes(32).toString('hex');

const dinoz = { id: 1, placeId: 1, unavailableReason: null, followers: [] };

/** The stored dungeon row for `d`: not in DungeonList, so no placeStart gate. */
function dungeonRowFor(d: DungeonStruct) {
	const sealed = seal(new DungeonCodec().encode(d));
	return {
		id: 'dungeon1',
		name: 'unit-test-dungeon',
		cipher: sealed.cipher,
		iv: sealed.iv,
		tag: sealed.tag,
		type: 'cavern',
		level: 1,
		monsters: '[]',
		scenarios: '[]'
	};
}

/** A stored run row for `d`, dinoz at the start, nothing revealed yet. */
function runRowFor(d: DungeonStruct) {
	return {
		id: 'run1',
		leaderId: dinoz.id,
		posX: d.start.x,
		posY: d.start.y,
		posL: d.start.l,
		revealed: '[]',
		keys: '[]',
		opened: '[]',
		scenarios: '[]',
		gold: '[]',
		defeated: '[]'
	};
}

describe('dungeonService — fog-of-war boundary', () => {
	const d = OriginalGenerator.generate({ seed: 7, width: 24, height: 24, levels: 2 });

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue({ id: 'player1' } as never);
		vi.mocked(getFollowingDinoz).mockResolvedValue(dinoz as never);
		vi.mocked(getDungeonByName).mockResolvedValue(dungeonRowFor(d) as never);
	});

	it('startRun never returns the layout, only the entrance reveal', async () => {
		vi.mocked(findRun).mockResolvedValue(null);
		vi.mocked(createRun).mockResolvedValue({ id: 'run1' } as never);
		const r = await startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }));
		// at most the 3×3 block around the entered cell
		expect(r.reveal.length).toBeGreaterThan(0);
		expect(r.reveal.length).toBeLessThanOrEqual(9);
		// no table / encoded string anywhere in the payload
		expect(JSON.stringify(r)).not.toContain('table');
		expect(JSON.stringify(r)).not.toContain('[[');
		// what hit the DB for this run is just position + revealed cell keys, never the layout
		const revealedArg = vi.mocked(createRun).mock.calls[0][1];
		expect(revealedArg).not.toContain('table');
		expect(revealedArg).not.toContain('[[');
	});

	it('rejects a step into a wall and reveals nothing', async () => {
		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
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
		const r = await move(
			makeRequest({
				params: { id: 'unit-test-dungeon' },
				body: { dinozId: 1, dx: wallDir![0], dy: wallDir![1], dl: 0 }
			})
		);
		expect(r.ok).toBe(false);
		expect(r.reveal).toEqual([]);
		expect(r.pos).toEqual({ l: d.start.l, x: d.start.x, y: d.start.y });
		expect(updateRun).not.toHaveBeenCalled();
	});

	it('accepts a step onto floor and reveals only new cells', async () => {
		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
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
		const r = await move(
			makeRequest({
				params: { id: 'unit-test-dungeon' },
				body: { dinozId: 1, dx: floorDir![0], dy: floorDir![1], dl: 0 }
			})
		);
		expect(r.ok).toBe(true);
		expect(r.pos).toEqual({ l: d.start.l, x: d.start.x + floorDir![0], y: d.start.y + floorDir![1] });
		expect(r.reveal.length).toBeLessThanOrEqual(9);
		expect(updateRun).toHaveBeenCalledOnce();
	});

	it('rejects diagonal and multi-cell steps', async () => {
		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
		expect(
			(await move(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1, dx: 1, dy: 1, dl: 0 } }))).ok
		).toBe(false);
		expect(
			(await move(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1, dx: 0, dy: 0, dl: 0 } }))).ok
		).toBe(false);
	});

	it('rejects a stair step when not on a stair cell', async () => {
		// The generator never puts a stair on the start cell.
		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
		const r = await move(
			makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1, dx: 0, dy: 0, dl: 1 } })
		);
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
