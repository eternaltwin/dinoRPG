import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import type { DungeonStruct } from '../../business/dungeon/types.js';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), addMoney: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozFicheLiteRequest: vi.fn(),
	getDinozFightDataRequest: vi.fn(),
	getFollowingDinoz: vi.fn(),
	getLeaderWithFollowers: vi.fn(),
	updateDinoz: vi.fn(),
	updateMultipleDinoz: vi.fn()
}));
vi.mock('../../dao/dungeonRunDao.js', () => ({
	createRun: vi.fn(),
	findRun: vi.fn(),
	getDungeonById: vi.fn(),
	getDungeonByName: vi.fn(),
	updateRun: vi.fn(),
	updateRunDefeated: vi.fn()
}));
vi.mock('../../utils/dungeonCrypto.js', () => ({ unseal: vi.fn(() => 'stub') }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/dungeon/DungeonCodec.js', () => {
	const stub: DungeonStruct = {
		width: 3,
		height: 3,
		start: { l: 0, x: 0, y: 0 },
		exit: { l: 0, x: 2, y: 2 },
		levels: [
			{
				table: [
					[true, true, true],
					[true, true, true],
					[true, true, true]
				],
				rooms: []
			}
		]
	} as unknown as DungeonStruct;
	return {
		DungeonCodec: vi.fn().mockImplementation(function (this: { decode: () => void; d: DungeonStruct }) {
			this.decode = vi.fn();
			this.d = stub;
		})
	};
});

import { auth } from '../../dao/playerDao.js';
import { getFollowingDinoz, updateMultipleDinoz } from '../../dao/dinozDao.js';
import { createRun, findRun, getDungeonByName } from '../../dao/dungeonRunDao.js';
import { startRun, exitRun } from '../../business/dungeonService.js';

const dungeon = {
	id: 'dungeon1',
	name: 'unit-test-dungeon', // no placeStart set: skips the place gate
	cipher: Buffer.from('c'),
	iv: Buffer.from('i'),
	tag: Buffer.from('t'),
	type: 'CAVE',
	level: 1,
	monsters: '[]',
	scenarios: '[]',
	placeStart: null,
	placeEnd: null,
	condition: '{}',
	monsterPool: '[]',
	isActive: true
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'player1' } as never);
	vi.mocked(getDungeonByName).mockResolvedValue(dungeon as never);
});

describe('dungeon team lock', () => {
	it('startRun refuses a team with a busy member instead of stealing it into a new run', async () => {
		vi.mocked(findRun).mockResolvedValue(null);
		vi.mocked(getFollowingDinoz).mockResolvedValue({
			id: 1,
			placeId: 1,
			unavailableReason: 'dungeon',
			followers: [],
			leaderId: null
		} as never);

		await expect(startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }))).rejects.toThrow(
			'dungeon.wrongTeam'
		);
		expect(createRun).not.toHaveBeenCalled();
		expect(updateMultipleDinoz).not.toHaveBeenCalled();
	});

	it('startRun lets a fully free team in and records it as the run team', async () => {
		vi.mocked(findRun).mockResolvedValue(null);
		vi.mocked(getFollowingDinoz).mockResolvedValue({
			id: 1,
			placeId: 1,
			unavailableReason: null,
			followers: [{ id: 2, unavailableReason: null }],
			leaderId: null
		} as never);
		vi.mocked(createRun).mockResolvedValue({ id: 'run1' } as never);

		await startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }));

		expect(createRun).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'player1', 'dungeon1', 1);
	});

	it('startRun refuses to resume another team’s in-progress run', async () => {
		vi.mocked(findRun).mockResolvedValue({
			id: 'run1',
			leaderId: 9,
			posL: 0,
			posX: 0,
			posY: 0,
			revealed: '[]',
			defeated: '[]',
			opened: '[]',
			keys: '[]',
			gold: '[]',
			scenarios: '[]'
		} as never);
		vi.mocked(getFollowingDinoz).mockResolvedValue({
			id: 1,
			placeId: 1,
			unavailableReason: null,
			followers: [],
			leaderId: null
		} as never);

		await expect(startRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }))).rejects.toThrow(
			'dungeon.wrongTeam'
		);
	});

	it('exitRun refuses to release a run that belongs to a different team', async () => {
		vi.mocked(findRun).mockResolvedValue({
			id: 'run1',
			leaderId: 9,
			posL: 0,
			posX: 0,
			posY: 0
		} as never);
		vi.mocked(getFollowingDinoz).mockResolvedValue({
			id: 1,
			placeId: 1,
			unavailableReason: 'dungeon',
			followers: [],
			leaderId: null
		} as never);

		await expect(exitRun(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dinozId: 1 } }))).rejects.toThrow(
			'dungeon.wrongTeam'
		);
		expect(updateMultipleDinoz).not.toHaveBeenCalled();
	});
});
