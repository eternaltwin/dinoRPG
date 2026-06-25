import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { ClanEventConfig } from '@drpg/core/models/clan/clanEventConfig';

vi.mock('../../context.js', () => ({ LOGGER: { log: vi.fn(), error: vi.fn() } }));
vi.mock('../../dao/clansDao.js', () => ({
	checkCanDeclareWar: vi.fn(),
	consumeRepairCost: vi.fn(),
	consumeWarCost: vi.fn(),
	getWarForResolve: vi.fn(),
	playerHasRightRequest: vi.fn(),
	updateWarRankings: vi.fn()
}));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozFightClanDataRequest: vi.fn(), updateDinoz: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../dao/archiveDao.js', () => ({ archiveFight: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/dinozItemDao.js', () => ({ removeItemFromDinoz: vi.fn() }));
vi.mock('../../utils/warCalculation.js', () => ({ computeWarRankingUpdates: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../utils/tools.js', () => ({ getRandomArrayElement: vi.fn().mockReturnValue(1) }));
vi.mock('@drpg/core/models/clan/warCalculation', () => ({
	computeWarCost: vi.fn().mockReturnValue({ canAfford: true, trueValue: 0 }),
	computeRepairCost: vi.fn().mockReturnValue({ canAfford: true, trueValue: 0 })
}));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('../../business/serverEventService.js', () => ({ sendSseMessageToUserInChannel: vi.fn() }));
vi.mock('node-schedule', () => {
	const job = { cancel: vi.fn(), schedule: vi.fn() };
	return { scheduleJob: vi.fn(), scheduledJobs: new Proxy({}, { get: () => job }) };
});

const txObj = {
	clanCastle: { findUnique: vi.fn(), update: vi.fn() },
	dinoz: { update: vi.fn() },
	clan: { findUnique: vi.fn() },
	clanWar: { create: vi.fn() }
};
vi.mock('../../prisma.js', () => ({
	prisma: {
		clanEvent: { findFirst: vi.fn() },
		clanCastle: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
		clanIngredient: { deleteMany: vi.fn() },
		clan: { update: vi.fn() },
		clanWarRanking: { upsert: vi.fn() },
		clanHistory: { create: vi.fn() },
		clanWar: { findMany: vi.fn(), findUnique: vi.fn() },
		clanCastleRepair: { findMany: vi.fn(), fields: { totalTicks: 'totalTicks' } },
		dinoz: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
		serverState: { findUnique: vi.fn() },
		$transaction: vi.fn()
	}
}));

import { prisma } from '../../prisma.js';
import { auth } from '../../dao/playerDao.js';
import { playerHasRightRequest } from '../../dao/clansDao.js';
import {
	eventState,
	currentWar,
	declareWar,
	buildClanCastle,
	scheduleWarExpiration,
	warStatus,
	forfeitWar,
	addDefender,
	castleStatus,
	removeDefender,
	updateDefenseOrder
} from '../../business/clanWar.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });
const warConfig: ClanEventConfig = { warPlaces: [1, 2], fight: { defenderActiveMax: 5 } } as never;
const ongoingWar = () => ({
	id: 'w1',
	endDate: new Date(Date.now() + 1000000),
	startDate: new Date(Date.now() - 1000000),
	config: JSON.stringify(warConfig)
});

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1', name: 'Bob', clanId: 1 } as never);
	vi.mocked(playerHasRightRequest).mockResolvedValue(true as never);
	vi.mocked(prisma.clanEvent.findFirst).mockResolvedValue(ongoingWar() as never);
	vi.mocked(prisma.$transaction).mockImplementation(async (arg: never) => {
		if (typeof arg === 'function') {
			return (arg as unknown as (tx: unknown) => unknown)(txObj);
		}
		return Promise.all(arg as never);
	});
});

describe('eventState / currentWar', () => {
	it('eventState returns the ongoing event', async () => {
		const result = await eventState();
		expect(result).toEqual({ id: 'w1', endDate: expect.any(Date) });
	});
	it('eventState returns undefined when no war', async () => {
		vi.mocked(prisma.clanEvent.findFirst).mockResolvedValue(null as never);
		expect(await eventState()).toBeUndefined();
	});
	it('currentWar returns parsed config', async () => {
		const result = await currentWar();
		expect(result.config.warPlaces).toEqual([1, 2]);
	});
	it('currentWar throws when no war', async () => {
		vi.mocked(prisma.clanEvent.findFirst).mockResolvedValue(null as never);
		await expect(currentWar()).rejects.toThrow('No event in progress');
	});
});

describe('declareWar', () => {
	const defender = () => ({
		id: 2,
		name: 'Foes',
		castle: { id: 'c2', currentLife: 300 },
		members: [{ playerId: 'd1' }],
		_count: { defendingWars: 0 }
	});
	const attacker = () => ({
		id: 1,
		name: 'Us',
		castle: { id: 'c1', currentLife: 300 },
		members: [{ playerId: 'p1' }],
		ingredients: [{ ingredientId: 1, quantity: 100 }],
		clanWarRanking: [{ reputation: 100 }]
	});
	it('declares a war when all checks pass', async () => {
		txObj.clan.findUnique.mockResolvedValueOnce(defender()).mockResolvedValueOnce(attacker());
		txObj.clanWar.create.mockResolvedValue({ id: 'war1' });
		await declareWar(req({ clanId: '2' }));
		expect(txObj.clanWar.create).toHaveBeenCalled();
		expect(prisma.clanHistory.create).toHaveBeenCalled();
	});
	it('throws when attacking your own clan', async () => {
		await expect(declareWar(req({ clanId: '1' }))).rejects.toThrow('sameClan');
	});
	it('throws when the defender has no castle', async () => {
		txObj.clan.findUnique.mockResolvedValueOnce({ ...defender(), castle: null }).mockResolvedValueOnce(attacker());
		await expect(declareWar(req({ clanId: '2' }))).rejects.toThrow('noCastleOpponent');
	});
	it('throws without the right', async () => {
		vi.mocked(playerHasRightRequest).mockResolvedValue(false as never);
		await expect(declareWar(req({ clanId: '2' }))).rejects.toThrow('noRight');
	});
});

describe('buildClanCastle', () => {
	it('builds a new castle', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue(null as never);
		await buildClanCastle(req());
		expect(prisma.clanCastle.upsert).toHaveBeenCalled();
		expect(prisma.clanHistory.create).toHaveBeenCalled();
	});
	it('rebuilds an existing destroyed castle', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({ currentLife: 0 } as never);
		await buildClanCastle(req());
		expect(prisma.clanCastle.upsert).toHaveBeenCalled();
	});
	it('throws when castle already built', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({ currentLife: 300 } as never);
		await expect(buildClanCastle(req())).rejects.toThrow('castleAlreadyBuilt');
	});
	it('throws without the right', async () => {
		vi.mocked(playerHasRightRequest).mockResolvedValue(false as never);
		await expect(buildClanCastle(req())).rejects.toThrow('noRight');
	});
	it('throws without a clan', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'p1', name: 'Bob', clanId: null } as never);
		await expect(buildClanCastle(req())).rejects.toThrow('noClan');
	});
});

describe('scheduleWarExpiration', () => {
	it('schedules ongoing wars and pending repairs', async () => {
		vi.mocked(prisma.clanWar.findMany).mockResolvedValue([{ id: 'w1', endsAt: new Date() }] as never);
		vi.mocked(prisma.dinoz.updateMany).mockResolvedValue({ count: 2 } as never);
		vi.mocked(prisma.clanCastleRepair.findMany).mockResolvedValue([
			{ id: 'r1', castleId: 'c1', hpPerTick: 1, frequency: 'hourly', totalTicks: 5 }
		] as never);
		await scheduleWarExpiration();
		expect(prisma.clanWar.findMany).toHaveBeenCalled();
	});
	it('returns early when no war', async () => {
		vi.mocked(prisma.clanEvent.findFirst).mockResolvedValue(null as never);
		await scheduleWarExpiration();
		expect(prisma.clanWar.findMany).not.toHaveBeenCalled();
	});
});

describe('warStatus', () => {
	it('returns ongoing wars for a clan', async () => {
		vi.mocked(prisma.clanWar.findMany).mockResolvedValue([{ id: 'w1' }] as never);
		expect(await warStatus(req({ clanId: '1' }))).toEqual([{ id: 'w1' }]);
	});
});

describe('forfeitWar', () => {
	it('throws when not the attacking clan', async () => {
		vi.mocked(prisma.clanWar.findUnique).mockResolvedValue({ attackerClanId: 999 } as never);
		await expect(forfeitWar(req({ warId: 'w1' }))).rejects.toThrow('notWar');
	});
	it('throws without the right', async () => {
		vi.mocked(playerHasRightRequest).mockResolvedValue(false as never);
		await expect(forfeitWar(req({ warId: 'w1' }))).rejects.toThrow('noRight');
	});
});

describe('addDefender', () => {
	const dinoz = (overrides = {}) => ({
		id: 5,
		name: 'd',
		display: 'x',
		maxLife: 100,
		life: 100,
		placeId: 1,
		playerId: 'p1',
		unavailableReason: null,
		...overrides
	});
	it('adds a defender', async () => {
		vi.mocked(prisma.dinoz.findUnique).mockResolvedValue(dinoz() as never);
		txObj.clanCastle.findUnique.mockResolvedValue({ placeId: 1, defender: [], _count: { defender: 0 } });
		txObj.clanCastle.update.mockResolvedValue({ defender: [{ id: 5 }] });
		const result = await addDefender(req({ dinozId: '5' }));
		expect(result).toBeDefined();
	});
	it('throws when dinoz not found', async () => {
		vi.mocked(prisma.dinoz.findUnique).mockResolvedValue(null as never);
		await expect(addDefender(req({ dinozId: '5' }))).rejects.toThrow('dinozNotFound');
	});
	it('throws when not your dinoz', async () => {
		vi.mocked(prisma.dinoz.findUnique).mockResolvedValue(dinoz({ playerId: 'other' }) as never);
		await expect(addDefender(req({ dinozId: '5' }))).rejects.toThrow('notYourDinoz');
	});
	it('throws when dinoz is dead/unavailable', async () => {
		vi.mocked(prisma.dinoz.findUnique).mockResolvedValue(dinoz({ life: 0 }) as never);
		await expect(addDefender(req({ dinozId: '5' }))).rejects.toThrow('DinozIsDead');
	});
});

describe('castleStatus', () => {
	it('returns the castle with next prospector visit', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({
			currentLife: 100,
			defender: [],
			defenseOrder: [],
			repairs: []
		} as never);
		vi.mocked(prisma.serverState.findUnique).mockResolvedValue({ nextCheck: new Date() } as never);
		const result = await castleStatus(req());
		expect(result).toHaveProperty('nextProspectorVisit');
	});
	it('returns null when no castle', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue(null as never);
		expect(await castleStatus(req())).toBeNull();
	});
});

describe('removeDefender', () => {
	it('removes a defending dinoz', async () => {
		vi.mocked(prisma.dinoz.findUnique).mockResolvedValue({ id: 5, playerId: 'p1' } as never);
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({ id: 'c1', defenseOrder: [5] } as never);
		await removeDefender(req({ dinozId: '5' }));
		expect(prisma.$transaction).toHaveBeenCalled();
	});
	it('throws when dinoz is not defending', async () => {
		vi.mocked(prisma.dinoz.findUnique).mockResolvedValue({ id: 5, playerId: 'p1' } as never);
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({ id: 'c1', defenseOrder: [] } as never);
		await expect(removeDefender(req({ dinozId: '5' }))).rejects.toThrow('notInDefense');
	});
});

describe('updateDefenseOrder', () => {
	it('updates the defense order', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockReturnValue({
			defender: [{ id: 1 }, { id: 2 }],
			defenseOrder: [1, 2]
		} as never);
		vi.mocked(prisma.clanCastle.update).mockReturnValue({
			defender: [{ id: 1 }, { id: 2 }],
			defenseOrder: [2, 1]
		} as never);
		const result = await updateDefenseOrder(req({}, { previousDinozIds: [1, 2], dinozIds: [2, 1] }));
		expect(result.map(defender => defender.id)).toEqual([2, 1]);
	});
	it('throws on outdated defense', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({
			defender: [{ id: 1 }, { id: 2 }],
			defenseOrder: [1, 2]
		} as never);
		await expect(updateDefenseOrder(req({}, { previousDinozIds: [1, 2, 3], dinozIds: [2, 1, 3] }))).rejects.toThrow(
			'outdatedDefense'
		);
	});
	it('throws on invalid order', async () => {
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({
			defender: [{ id: 1 }, { id: 2 }],
			defenseOrder: [1, 2]
		} as never);
		await expect(updateDefenseOrder(req({}, { previousDinozIds: [1, 2], dinozIds: [2, 1, 3] }))).rejects.toThrow(
			'invalidDefenseOrder'
		);
	});
});
