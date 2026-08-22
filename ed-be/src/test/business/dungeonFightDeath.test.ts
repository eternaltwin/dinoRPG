import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import type { DungeonStruct } from '../../business/dungeon/types.js';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), addMoney: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozFightDataRequest: vi.fn(),
	updateDinoz: vi.fn(),
	updateMultipleDinoz: vi.fn()
}));
vi.mock('../../dao/dungeonRunDao.js', () => ({
	getDungeonById: vi.fn(),
	getDungeonByName: vi.fn(),
	findRun: vi.fn(),
	updateRun: vi.fn(),
	updateRunDefeated: vi.fn()
}));
vi.mock('../../utils/dungeonCrypto.js', () => ({ unseal: vi.fn(() => 'stub') }));
vi.mock('../../business/fightService.js', () => ({
	calculateFightVsMonsters: vi.fn(),
	rewardFightVsMonsters: vi.fn()
}));
vi.mock('../../business/dungeon/DungeonCodec.js', () => {
	// One step right of start (0,0) lands on the monster cell (1,0).
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
import { getDinozFightDataRequest, updateDinoz, updateMultipleDinoz } from '../../dao/dinozDao.js';
import { findRun, getDungeonByName } from '../../dao/dungeonRunDao.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../business/fightService.js';
import { move } from '../../business/dungeonService.js';

const dungeon = {
	id: 'dungeon1',
	name: 'unit-test-dungeon',
	cipher: Buffer.from('c'),
	iv: Buffer.from('i'),
	tag: Buffer.from('t'),
	type: 'CAVE',
	level: 1,
	monsters: JSON.stringify([{ l: 0, x: 1, y: 0, monsters: ['GOUPIGNON'] }]),
	scenarios: '[]',
	placeStart: null,
	placeEnd: null,
	condition: '{}',
	monsterPool: '[]',
	isActive: true
};

const run = {
	id: 'run1',
	posL: 0,
	posX: 0,
	posY: 0,
	revealed: '[]',
	defeated: '[]',
	keys: '[]',
	opened: '[]',
	scenarios: '[]',
	gold: '[]',
	leaderId: 1
};

/** A dinoz fit for the fight-data shape move() reads off `player.dinoz`. */
function fighter(id: number, life: number) {
	return {
		id,
		life,
		unavailableReason: 'dungeon',
		fight: true,
		concentration: false,
		status: [],
		skills: [],
		items: []
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'player1' } as never);
	vi.mocked(getDungeonByName).mockResolvedValue(dungeon as never);
	vi.mocked(findRun).mockResolvedValue(run as never);
	vi.mocked(calculateFightVsMonsters).mockReturnValue({} as never);
});

describe('dungeon fight death', () => {
	it('a dinoz that dies in the fight leaves the party and the dungeon', async () => {
		vi.mocked(getDinozFightDataRequest).mockResolvedValue({
			id: 'player1',
			cooker: false,
			dinoz: [fighter(1, 50), fighter(2, 5)]
		} as never);
		vi.mocked(calculateFightVsMonsters).mockReturnValue({
			attackers: [
				{ dinozId: 1, hpLost: 10 },
				{ dinozId: 2, hpLost: 999 }
			]
		} as never);
		vi.mocked(rewardFightVsMonsters).mockResolvedValue({ result: true } as never);

		await move(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dx: 1, dy: 0, dl: 0, dinozId: 1 } }));

		// Dinoz 2 died: disconnected from the leader and freed from unavailableReason.
		expect(updateDinoz).toHaveBeenCalledWith(2, { leader: { disconnect: true }, unavailableReason: null });
		expect(updateDinoz).not.toHaveBeenCalledWith(1, expect.anything());
		// Only the survivor gets its fight flag reset.
		expect(updateMultipleDinoz).toHaveBeenCalledWith([1], { fight: false });
	});

	it('a fight nobody dies in leaves the party untouched', async () => {
		vi.mocked(getDinozFightDataRequest).mockResolvedValue({
			id: 'player1',
			cooker: false,
			dinoz: [fighter(1, 50), fighter(2, 40)]
		} as never);
		vi.mocked(calculateFightVsMonsters).mockReturnValue({
			attackers: [
				{ dinozId: 1, hpLost: 10 },
				{ dinozId: 2, hpLost: 5 }
			]
		} as never);
		vi.mocked(rewardFightVsMonsters).mockResolvedValue({ result: true } as never);

		await move(makeRequest({ params: { id: 'unit-test-dungeon' }, body: { dx: 1, dy: 0, dl: 0, dinozId: 1 } }));

		expect(updateDinoz).not.toHaveBeenCalled();
		expect(updateMultipleDinoz).toHaveBeenCalledWith([1, 2], { fight: false });
	});
});
