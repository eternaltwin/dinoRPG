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
	updateRunDefeated: vi.fn(),
	findRunByLeader: vi.fn(),
	updateRunHealing: vi.fn(),
	flushRun: vi.fn()
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

vi.mock('../../utils/server/translate.js', () => ({
	default: vi.fn((key: string) => key)
}));


import {
	createRun,
	findRun,
	findRunByLeader,
	updateRun,
	updateRunHealing,
	getDungeonByName,
	getDungeonById
} from '../../dao/dungeonRunDao.js';
import { auth } from '../../dao/playerDao.js';
import { getFollowingDinoz } from '../../dao/dinozDao.js';
import { startRun, move, isOnHealingCell, markHealingCellUsed } from '../../business/dungeonService.js';
import { DungeonItem } from '../../business/dungeon/types.js';
import { OriginalGenerator } from '../../business/dungeon/original/index.js';
import { DungeonCodec } from '../../business/dungeon/DungeonCodec.js';
import { findPath } from '../../business/dungeon/pathfind.js';
import { seal } from '../../utils/dungeonCrypto.js';
import type { DungeonStruct } from '../../business/dungeon/types.js';
import { UnavailableReason } from '@drpg/prisma';

process.env.DUNGEON_KEY = randomBytes(32).toString('hex');

const DEFAULT_DINOZ_ID = 1;
const TEST_PLACE_ID = 1;
const mockAuthed: any = { id: 'player1', lang: 'en' };

function makeDinoz(overrides: Record<string, any> = {}): any {
	return {
		id: DEFAULT_DINOZ_ID,
		placeId: TEST_PLACE_ID,
		unavailableReason: null,
		fight: true,
		followers: [],
		leaderId: null,
		...overrides
	}
};


/** The stored dungeon row for `d`: no placeStart set, so no place gate. */
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
		scenarios: '[]',
		placeStart: TEST_PLACE_ID,
		placeEnd: TEST_PLACE_ID,
		condition: '{}',
		monsterPool: '[]',
		isActive: true
	};
}

/** A stored run row for `d`, dinoz at the start, nothing revealed yet. */
function runRowFor(d: DungeonStruct) {
	return {
		id: 'run1',
		leaderId: DEFAULT_DINOZ_ID,
		posX: d.start.x,
		posY: d.start.y,
		posL: d.start.l,
		revealed: '[]',
		keys: '[]',
		opened: '[]',
		scenarios: '[]',
		gold: '[]',
		healed: '[]',
		healPending: null,
		defeated: '[]'
	};
}

describe('dungeonService - startRun', () => {
	const d = OriginalGenerator.generate({ seed: 7, width: 24, height: 24, levels: 2 });

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue(mockAuthed);
		vi.mocked(getFollowingDinoz).mockResolvedValue(makeDinoz());
		vi.mocked(getDungeonByName).mockResolvedValue(dungeonRowFor(d) as never);
	});

	it('throws if Dinoz not found', async () => {
		vi.mocked(getFollowingDinoz).mockResolvedValue(null);
		await expect(startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }))).rejects.toThrow('dinozNotFound');
	});

	it('throws if Dinoz not leader', async () => {
		vi.mocked(getFollowingDinoz).mockResolvedValue(makeDinoz({ leaderId: 123 }));
		await expect(startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }))).rejects.toThrow('notLeader');
	});

	it('throws if Dinoz not at dungeon place', async () => {
		vi.mocked(getFollowingDinoz).mockResolvedValue(makeDinoz({ placeId: 123 }));
		await expect(startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }))).rejects.toThrow('dungeon.wrongPlace');
	});

	it('throws if Dinoz not available', async () => {
		vi.mocked(getFollowingDinoz).mockResolvedValue(makeDinoz({ unavailableReason: UnavailableReason.frozen }));
		await expect(startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }))).rejects.toThrow('error.dinozNotAvailable');
	});
});

describe('dungeonService — fog-of-war boundary', () => {
	const d = OriginalGenerator.generate({ seed: 7, width: 24, height: 24, levels: 2 });

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue(mockAuthed);
		vi.mocked(getFollowingDinoz).mockResolvedValue(makeDinoz());
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

	it('reports run.status created vs resumed', async () => {
		vi.mocked(findRun).mockResolvedValue(null);
		vi.mocked(createRun).mockResolvedValue({ id: 'run1' } as never);
		const fresh = await startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }));
		expect(fresh.run).toEqual({ id: 'run1', status: 'created' });

		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
		const resumed = await startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }));
		// 'unit-test-dungeon' isn't in DungeonList (see dungeonRowFor), so there's no
		// dungeonRef to build the resume message from.
		expect(resumed.run).toEqual({ id: 'run1', status: 'resumed', message: 'dungeon.unit-test-dungeon.enter' });
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
				body: { dinozId: 1, steps: [{ dx: wallDir![0], dy: wallDir![1], dl: 0 }] }
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
				body: { dinozId: 1, steps: [{ dx: floorDir![0], dy: floorDir![1], dl: 0 }] }
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
			(
				await move(
					makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1, steps: [{ dx: 1, dy: 1, dl: 0 }] } })
				)
			).ok
		).toBe(false);
		expect(
			(
				await move(
					makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1, steps: [{ dx: 0, dy: 0, dl: 0 }] } })
				)
			).ok
		).toBe(false);
	});

	/** The first `n` same-level steps of the solution path out of the start cell. */
	function stepsFromStart(d: DungeonStruct, n: number) {
		const path = findPath(d, d.start, d.exit);
		expect(path).not.toBeNull();
		const steps = [];
		for (let i = 1; i < path!.length && steps.length < n; i++) {
			const from = path![i - 1];
			const to = path![i];
			if (to.l !== from.l) break; // stop at the first stair
			steps.push({ dx: to.x - from.x, dy: to.y - from.y, dl: 0 });
		}
		expect(steps.length).toBe(n);
		return { steps, cells: path!.slice(1, n + 1) };
	}

	it('applies a batch of steps in order and persists once', async () => {
		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
		vi.mocked(updateRun).mockResolvedValue({} as never);
		const { steps, cells } = stepsFromStart(d, 3);
		const r = await move(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1, steps } }));
		expect(r.ok).toBe(true);
		expect(r.applied).toBe(3);
		// landed on the third cell of the path, not the first
		expect(r.pos).toEqual(cells[2]);
		// one write for the whole batch, not one per step
		expect(updateRun).toHaveBeenCalledOnce();
		expect(vi.mocked(updateRun).mock.calls[0][1]).toEqual({ posX: cells[2].x, posY: cells[2].y, posL: cells[2].l });
		// the batch still reveals only what walking those cells reveals
		expect(r.reveal.length).toBeLessThanOrEqual(9 * 3);
		expect(JSON.stringify(r)).not.toContain('table');
	});

	it('a batch stops at the first refused step, keeping what came before', async () => {
		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
		vi.mocked(updateRun).mockResolvedValue({} as never);
		const { steps, cells } = stepsFromStart(d, 2);
		// wedge a step into a real wall neighbour of the cell step 1 lands on
		const t = d.levels[cells[0].l].table;
		const wallDir = (
			[
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1]
			] as [number, number][]
		).find(([dx, dy]) => !(t[cells[0].x + dx]?.[cells[0].y + dy] ?? false));
		expect(wallDir).toBeDefined();
		const wall = { dx: wallDir![0], dy: wallDir![1], dl: 0 };
		const r = await move(
			makeRequest({
				params: { id: 'unit-test-dungeon' },
				body: { dinozId: 1, steps: [steps[0], wall, steps[1]] }
			})
		);
		expect(r.ok).toBe(false);
		expect(r.applied).toBe(1);
		expect(r.pos).toEqual(cells[0]);
		// the one applied step is still persisted, exactly once
		expect(updateRun).toHaveBeenCalledOnce();
		expect(vi.mocked(updateRun).mock.calls[0][1]).toEqual({ posX: cells[0].x, posY: cells[0].y, posL: cells[0].l });
	});

	it('rejects a stair step when not on a stair cell', async () => {
		// The generator never puts a stair on the start cell.
		vi.mocked(findRun).mockResolvedValue(runRowFor(d) as never);
		const r = await move(
			makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1, steps: [{ dx: 0, dy: 0, dl: 1 }] } })
		);
		expect(r.ok).toBe(false);
	});
});

describe('dungeonService — healing cell', () => {
	const d = OriginalGenerator.generate({ seed: 7, width: 24, height: 24, levels: 2 });
	const healCell = (() => {
		for (let l = 0; l < d.levels.length; l++)
			for (const r of d.levels[l].rooms) if (r.item?.k === DungeonItem.IHeal) return { l, x: r.item.x, y: r.item.y };
		throw new Error('generated dungeon has no heal cell');
	})();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getDungeonById).mockResolvedValue(dungeonRowFor(d) as never);
	});

	it('keeps healing while the party stands there, and dies once they walk off', async () => {
		const key = `${healCell.l},${healCell.x},${healCell.y}`;
		const run = {
			...runRowFor(d),
			dungeonId: 'dungeon1',
			posL: healCell.l,
			posX: healCell.x,
			posY: healCell.y,
			healPending: null as string | null
		};
		vi.mocked(findRunByLeader).mockResolvedValue(run as never);
		vi.mocked(findRun).mockResolvedValue(run as never);
		vi.mocked(updateRun).mockResolvedValue({} as never);
		vi.mocked(updateRunHealing).mockImplementation(async (_id, healed, healPending) => {
			run.healed = healed;
			run.healPending = healPending;
			return run as never;
		});
		const dinozOnCell = { id: 1, leaderId: null };

		expect(await isOnHealingCell(dinozOnCell)).toBe(true);
		await markHealingCellUsed(dinozOnCell);
		expect(run.healPending).toBe(key);
		// the rest of the team can still be healed on the same cell
		expect(await isOnHealingCell(dinozOnCell)).toBe(true);

		// one step off the cell spends it
		const dirs: [number, number][] = [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		];
		const t = d.levels[healCell.l].table;
		const away = dirs.find(([dx, dy]) => t[healCell.x + dx]?.[healCell.y + dy] === true);
		expect(away).toBeDefined();
		await move(
			makeRequest({
				params: { id: 'unit-test-dungeon' },
				body: { dinozId: 1, steps: [{ dx: away![0], dy: away![1], dl: 0 }] }
			})
		);
		expect(run.healPending).toBeNull();
		expect(JSON.parse(run.healed)).toEqual([key]);

		// walking back onto it doesn't bring it back
		expect(await isOnHealingCell(dinozOnCell)).toBe(false);
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
