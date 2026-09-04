import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../prisma.js', () => ({
	prisma: {
		dungeonRun: {
			findUnique: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn(),
			create: vi.fn()
		}
	}
}));
vi.mock('../../context.js', () => ({ LOGGER: { log: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { prisma } from '../../prisma.js';
import {
	clearRunCache,
	dinozExitRun,
	findRun,
	flushRun,
	updateRun,
	updateRunDefeated
} from '../../dao/dungeonRunDao.js';

type Row = {
	id: string;
	playerId: string;
	dungeonId: string;
	leaderId: number | null;
	posX: number;
	posY: number;
	posL: number;
	revealed: string;
	keys: string;
	opened: string;
	scenarios: string;
	gold: string;
	defeated: string;
};

/** Stands in for the persisted row — what would survive a crash. */
let stored: Row;

function freshRow(): Row {
	return {
		id: 'run1',
		playerId: 'player1',
		dungeonId: 'dungeon1',
		leaderId: 7,
		posX: 1,
		posY: 1,
		posL: 0,
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

beforeEach(() => {
	vi.clearAllMocks();
	clearRunCache();
	stored = freshRow();
	vi.mocked(prisma.dungeonRun.findUnique).mockImplementation((async () => ({ ...stored })) as never);
	vi.mocked(prisma.dungeonRun.findFirst).mockImplementation((async () => ({ ...stored })) as never);
	vi.mocked(prisma.dungeonRun.update).mockImplementation((async ({ data }: { data: Partial<Row> }) => {
		stored = { ...stored, ...data };
		return { ...stored };
	}) as never);
});

afterEach(() => clearRunCache());

describe('dungeonRun cache', () => {
	it('reads through once, then serves from memory', async () => {
		const a = await findRun('dungeon1', 'player1');
		const b = await findRun('dungeon1', 'player1');
		expect(prisma.dungeonRun.findUnique).toHaveBeenCalledOnce();
		expect(b).toBe(a); // same object, not a re-fetch
	});

	it('defers ordinary progress instead of writing it', async () => {
		const run = await findRun('dungeon1', 'player1');
		await updateRun(run!.id, { posX: 5, posY: 6, posL: 0 }, '["0,5,6"]', '[]', '[]', '[]', '[]');

		// nothing has hit the database yet...
		expect(prisma.dungeonRun.update).not.toHaveBeenCalled();
		expect(stored.posX).toBe(1);
		// ...but the cached row already reflects it, so the next move reads it back
		expect((await findRun('dungeon1', 'player1'))!.posX).toBe(5);

		await flushRun(run!.id);
		expect(stored.posX).toBe(5);
		expect(stored.revealed).toBe('["0,5,6"]');
	});

	it('flushRun is idempotent — a clean run writes nothing', async () => {
		const run = await findRun('dungeon1', 'player1');
		await updateRun(run!.id, { posX: 2, posY: 2, posL: 0 }, '[]', '[]', '[]', '[]', '[]');
		await flushRun(run!.id);
		expect(prisma.dungeonRun.update).toHaveBeenCalledOnce();
		await flushRun(run!.id);
		expect(prisma.dungeonRun.update).toHaveBeenCalledOnce();
	});

	/**
	 * The invariant the whole write-back design rests on: a reward is marked
	 * durably BEFORE it is paid out, so a crash in the gap can only lose a reward,
	 * never mint one. This is what dungeonService.move()'s checkpoint() buys.
	 */
	it('a checkpointed gold pile stays collected across a crash', async () => {
		const run = await findRun('dungeon1', 'player1');
		// move() marks the pile, then checkpoints (updateRun + flushRun), then pays.
		await updateRun(run!.id, { posX: 3, posY: 3, posL: 0 }, '[]', '[]', '[]', '[]', '["0,3,3"]');
		await flushRun(run!.id);

		// crash: the process dies before addMoney — the cache is gone, the DB is not
		clearRunCache();

		const resumed = await findRun('dungeon1', 'player1');
		expect(JSON.parse(resumed!.gold)).toContain('0,3,3');
	});

	it('without the checkpoint the same crash would re-pay — why checkpoint() exists', async () => {
		const run = await findRun('dungeon1', 'player1');
		await updateRun(run!.id, { posX: 3, posY: 3, posL: 0 }, '[]', '[]', '[]', '[]', '["0,3,3"]');
		// no flushRun here
		clearRunCache();

		const resumed = await findRun('dungeon1', 'player1');
		expect(JSON.parse(resumed!.gold)).not.toContain('0,3,3');
	});

	it('a defeated monster survives a crash once flushed', async () => {
		const run = await findRun('dungeon1', 'player1');
		await updateRunDefeated(run!.id, '["0,4,4"]');
		await flushRun(run!.id);
		clearRunCache();

		expect(JSON.parse((await findRun('dungeon1', 'player1'))!.defeated)).toContain('0,4,4');
	});

	it('exiting flushes pending progress and drops the run', async () => {
		const run = await findRun('dungeon1', 'player1');
		await updateRun(run!.id, { posX: 9, posY: 9, posL: 1 }, '["1,9,9"]', '[]', '[]', '[]', '[]');
		await dinozExitRun(run!.id);

		expect(stored.posX).toBe(9);
		expect(stored.leaderId).toBeNull();
		// evicted: the next read goes back to the database
		vi.mocked(prisma.dungeonRun.findUnique).mockClear();
		await findRun('dungeon1', 'player1');
		expect(prisma.dungeonRun.findUnique).toHaveBeenCalledOnce();
	});
});
