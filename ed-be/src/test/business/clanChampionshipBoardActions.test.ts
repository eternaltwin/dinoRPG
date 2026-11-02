import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() }, LOGGER: { error: vi.fn() } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ playerHasRightRequest: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('../../dao/archiveDao.js', () => ({ archiveFight: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozForChampionshipFight: vi.fn() }));
vi.mock('../../utils/gameConfig.js', () => ({ gameConfig: () => ({ dinoz: { maxLevel: 50 } }) }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		$queryRaw: vi.fn(),
		clanEvent: { findFirst: vi.fn(), findUnique: vi.fn() },
		clanChampionshipMatch: { findFirst: vi.fn(), findUnique: vi.fn() },
		clanChampionshipPiece: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			count: vi.fn(),
			upsert: vi.fn(),
			update: vi.fn(),
			deleteMany: vi.fn()
		},
		dinoz: { findUnique: vi.fn(), updateMany: vi.fn() }
	}
}));

import { calculateFightBetweenPlayers } from '../../business/fightService.js';
import { archiveFight } from '../../dao/archiveDao.js';
import { getDinozForChampionshipFight } from '../../dao/dinozDao.js';
import { auth } from '../../dao/playerDao.js';
import { prisma } from '../../prisma.js';
import {
	enterBoard,
	leaveBoard,
	moveOnBoard,
	removePlayerFromBoards,
	sideOf
} from '../../business/clanChampionshipMatchService.js';

const p = prisma as any;
const HOME = 1;
const AWAY = 2;
const PLAYER = 'player-1';
const startsAt = new Date('2026-11-23T18:00:00.000Z');
const endsAt = new Date('2026-11-25T18:00:00.000Z');
const now = new Date('2026-11-24T10:00:00.000Z');

const event = {
	id: 'ev-1',
	eventType: 'championship',
	startDate: new Date('2026-11-09T00:00:00.000Z'),
	endDate: new Date('2026-12-02T18:00:00.000Z'),
	config: JSON.stringify({
		eventType: 'championship',
		places: [PlaceEnum.DINOVILLE],
		registrationEnd: '2026-11-23T00:00:00.000Z',
		phase: 'running'
	})
};

const liveMatch = (o: Record<string, unknown> = {}) => ({
	id: 'a0000000-0000-4000-8000-000000000001',
	eventId: 'ev-1',
	homeClanId: HOME,
	awayClanId: AWAY,
	westClanId: HOME,
	placeId: 1,
	obstacles: [] as number[],
	startsAt,
	endsAt,
	status: 'live',
	...o
});

const dinozRow = (o: Record<string, unknown> = {}) => ({
	playerId: PLAYER,
	life: 10,
	placeId: 1,
	leaderId: null,
	unavailableReason: null,
	_count: { followers: 0 },
	...o
});

const pc = (o: Record<string, unknown> = {}) => ({
	id: 1,
	matchId: liveMatch().id,
	dinozId: 5,
	playerId: PLAYER,
	clanId: HOME,
	state: 'onBoard',
	x: 0,
	y: 3,
	actionPoints: 2,
	...o
});

const body = (b: Record<string, unknown>) => makeRequest({ body: b } as never);

function setup(m: ReturnType<typeof liveMatch> | null = liveMatch()) {
	vi.mocked(auth).mockResolvedValue({ id: PLAYER, clanId: HOME } as never);
	p.clanEvent.findFirst.mockResolvedValue(event);
	p.clanEvent.findUnique.mockResolvedValue(event);
	p.clanChampionshipMatch.findFirst.mockResolvedValue(m);
	p.clanChampionshipMatch.findUnique.mockResolvedValue(m);
	p.clanChampionshipPiece.findMany.mockResolvedValue([]);
	p.clanChampionshipPiece.findUnique.mockResolvedValue(null);
	p.clanChampionshipPiece.count.mockResolvedValue(0);
	p.dinoz.findUnique.mockResolvedValue(dinozRow());
	p.dinoz.updateMany.mockResolvedValue({ count: 1 });
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers();
	vi.setSystemTime(now);
	p.$transaction.mockImplementation(async (cb: any) => cb(p));
});
afterEach(() => vi.useRealTimers());

describe('sideOf', () => {
	it('is west for the west clan', () => {
		expect(sideOf(liveMatch() as never, HOME)).toBe('west');
		expect(sideOf(liveMatch() as never, AWAY)).toBe('east');
	});
});

describe('common checks', () => {
	it('noLiveMatch without a live match', async () => {
		setup(null);
		await expect(enterBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.noLiveMatch');
	});
	it('noLiveMatch without clan', async () => {
		setup();
		vi.mocked(auth).mockResolvedValue({ id: PLAYER, clanId: null } as never);
		await expect(enterBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.noLiveMatch');
	});
	it('noLiveMatch when the match is no longer live under the lock', async () => {
		setup();
		p.clanChampionshipMatch.findUnique.mockResolvedValue(liveMatch({ status: 'finished' }));
		await expect(enterBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.noLiveMatch');
	});
	it('noLiveMatch once endsAt is reached', async () => {
		setup();
		vi.setSystemTime(endsAt);
		await expect(enterBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.noLiveMatch');
	});
	it('locks the match before reading the pieces', async () => {
		setup();
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc());
		await leaveBoard(body({ dinozId: 5 }));
		const lock = p.$queryRaw.mock.invocationCallOrder[0];
		expect(lock).toBeLessThan(p.clanChampionshipPiece.findUnique.mock.invocationCallOrder[0]);
	});
});

describe('enterBoard', () => {
	const enter = () => enterBoard(body({ dinozId: 5 }));
	beforeEach(() => setup());

	it('notYourDinoz', async () => {
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ playerId: 'other' }));
		await expect(enter()).rejects.toThrow('clanChampionship.notYourDinoz');
	});
	it('notYourDinoz when missing', async () => {
		p.dinoz.findUnique.mockResolvedValue(null);
		await expect(enter()).rejects.toThrow('clanChampionship.notYourDinoz');
	});
	it('dinozDead', async () => {
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ life: 0 }));
		await expect(enter()).rejects.toThrow('clanChampionship.dinozDead');
	});
	it('wrongPlace', async () => {
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ placeId: 2 }));
		await expect(enter()).rejects.toThrow('clanChampionship.wrongPlace');
	});
	it('dinozInGroup (leader or followers)', async () => {
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ leaderId: 9 }));
		await expect(enter()).rejects.toThrow('clanChampionship.dinozInGroup');
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ _count: { followers: 1 } }));
		await expect(enter()).rejects.toThrow('clanChampionship.dinozInGroup');
	});
	it('dinozBusy', async () => {
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ unavailableReason: 'selling' }));
		await expect(enter()).rejects.toThrow('clanChampionship.dinozBusy');
	});
	it('deadInMatch', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ state: 'dead' }));
		await expect(enter()).rejects.toThrow('clanChampionship.deadInMatch');
	});
	it('quotaReached for a new dinoz', async () => {
		p.clanChampionshipPiece.count.mockResolvedValue(100);
		await expect(enter()).rejects.toThrow('clanChampionship.quotaReached');
	});
	it('entryFull', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue(Array.from({ length: 20 }, (_, y) => ({ x: 0, y })));
		await expect(enter()).rejects.toThrow('clanChampionship.entryFull');
	});
	it('success writes the piece on the entry column and locks the dinoz', async () => {
		await enter();
		const call = p.clanChampionshipPiece.upsert.mock.calls[0][0];
		expect(call.create).toMatchObject({
			dinozId: 5,
			playerId: PLAYER,
			clanId: HOME,
			state: 'onBoard',
			x: 0,
			actionPoints: 0
		});
		expect(call.update).toMatchObject({ state: 'onBoard', x: 0, actionPoints: 0 });
		expect(p.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 5, unavailableReason: null, placeId: 1, life: { gt: 0 } },
			data: { unavailableReason: 'clanChampionship' }
		});
	});
	it('east clan enters on column 19', async () => {
		vi.mocked(auth).mockResolvedValue({ id: PLAYER, clanId: AWAY } as never);
		await enter();
		expect(p.clanChampionshipPiece.upsert.mock.calls[0][0].create.x).toBe(19);
	});
	it('dinozBusy when the conditional lock matches nothing', async () => {
		p.dinoz.updateMany.mockResolvedValue({ count: 0 });
		await expect(enter()).rejects.toThrow('clanChampionship.dinozBusy');
		expect(p.clanChampionshipPiece.upsert).not.toHaveBeenCalled();
	});
	it('re-entry by a player of the other clan counts the quota and takes over the piece', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'buyer', clanId: AWAY } as never);
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ playerId: 'buyer' }));
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ state: 'left', x: null, y: null }));
		p.clanChampionshipPiece.count.mockResolvedValue(100);
		await expect(enter()).rejects.toThrow('clanChampionship.quotaReached');
		p.clanChampionshipPiece.count.mockResolvedValue(3);
		await enter();
		expect(p.clanChampionshipPiece.count).toHaveBeenCalledWith({ where: { matchId: liveMatch().id, clanId: AWAY } });
		const call = p.clanChampionshipPiece.upsert.mock.calls[0][0];
		expect(call.update).toMatchObject({ playerId: 'buyer', clanId: AWAY, x: 19, state: 'onBoard' });
	});
	it('re-entry by another player of the same clan updates the owner without quota', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'buyer', clanId: HOME } as never);
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ playerId: 'buyer' }));
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ state: 'left', x: null, y: null }));
		p.clanChampionshipPiece.count.mockResolvedValue(100);
		await enter();
		expect(p.clanChampionshipPiece.count).not.toHaveBeenCalled();
		expect(p.clanChampionshipPiece.upsert.mock.calls[0][0].update).toMatchObject({ playerId: 'buyer', clanId: HOME });
	});
	it('re-entry of a left piece does not count the quota', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ state: 'left', x: null, y: null }));
		p.clanChampionshipPiece.count.mockResolvedValue(100);
		await enter();
		expect(p.clanChampionshipPiece.upsert).toHaveBeenCalled();
	});
});

describe('leaveBoard', () => {
	beforeEach(() => setup());
	it('notOnBoard', async () => {
		await expect(leaveBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.notOnBoard');
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ state: 'left' }));
		await expect(leaveBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.notOnBoard');
	});
	it('notYourDinoz', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ playerId: 'other' }));
		await expect(leaveBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.notYourDinoz');
	});
	it('notOnEntryColumn', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 1 }));
		await expect(leaveBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.notOnEntryColumn');
	});
	it('success unlocks the dinoz', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc());
		await leaveBoard(body({ dinozId: 5 }));
		expect(p.clanChampionshipPiece.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { state: 'left', x: null, y: null, actionPoints: 0 }
		});
		expect(p.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 5, unavailableReason: 'clanChampionship' },
			data: { unavailableReason: null }
		});
	});
});

describe('moveOnBoard', () => {
	const move = (direction: BoardDirection) => moveOnBoard(body({ dinozId: 5, direction }));
	beforeEach(() => {
		setup();
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 5, y: 5 }));
	});

	it('notOnBoard', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(null);
		await expect(move(BoardDirection.E)).rejects.toThrow('clanChampionship.notOnBoard');
	});
	it('noActionPoints', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 5, y: 5, actionPoints: 0 }));
		await expect(move(BoardDirection.E)).rejects.toThrow('clanChampionship.noActionPoints');
	});
	it('outOfBoard', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 0, y: 0 }));
		await expect(move(BoardDirection.N)).rejects.toThrow('clanChampionship.outOfBoard');
	});
	it('obstacle', async () => {
		p.clanChampionshipMatch.findUnique.mockResolvedValue(liveMatch({ obstacles: [5 * 20 + 6] }));
		await expect(move(BoardDirection.E)).rejects.toThrow('clanChampionship.obstacle');
	});
	it('cellOccupied by an own piece', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([{ id: 2, clanId: HOME, x: 6, y: 5 }]);
		await expect(move(BoardDirection.E)).rejects.toThrow('clanChampionship.cellOccupied');
	});
	it('success moves and decrements AP', async () => {
		const r = await move(BoardDirection.E);
		expect(r).toEqual({ fight: null });
		expect(p.clanChampionshipPiece.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { x: 6, y: 5, actionPoints: { decrement: 1 } }
		});
	});
	it('an enemy target reaches the attack resolution after paying the AP', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([{ id: 2, clanId: AWAY, x: 6, y: 5 }]);
		// No dinoz returned for the fight: the engine is mocked, an empty result is enough.
		vi.mocked(getDinozForChampionshipFight).mockResolvedValue([]);
		vi.mocked(calculateFightBetweenPlayers).mockReturnValue({
			outcome: 0,
			attackers: [],
			defenders: [],
			steps: [],
			fighters: []
		} as never);
		vi.mocked(archiveFight).mockResolvedValue({ id: 'arch-1' } as never);
		const r = await move(BoardDirection.E);
		expect(r).toEqual({ fight: { archiveId: 'arch-1', outcome: 0, deadDinozIds: [] } });
		expect(p.clanChampionshipPiece.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { actionPoints: { decrement: 1 } }
		});
	});
});

describe('removePlayerFromBoards', () => {
	it('deletes non-dead pieces and unlocks their dinoz', async () => {
		setup();
		p.clanChampionshipPiece.findMany.mockResolvedValue([{ dinozId: 5 }, { dinozId: 6 }]);
		await removePlayerFromBoards(PLAYER, HOME);
		expect(p.clanChampionshipPiece.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ playerId: PLAYER, state: { not: 'dead' } }) })
		);
		expect(p.clanChampionshipPiece.deleteMany).toHaveBeenCalledWith({
			where: { matchId: liveMatch().id, playerId: PLAYER, state: { not: 'dead' } }
		});
		expect(p.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: { in: [5, 6] }, unavailableReason: 'clanChampionship' },
			data: { unavailableReason: null }
		});
		expect(p.$queryRaw).toHaveBeenCalled();
	});
	it('does nothing when the match is no longer live under the lock', async () => {
		setup();
		p.clanChampionshipMatch.findUnique.mockResolvedValue(liveMatch({ status: 'finished' }));
		await removePlayerFromBoards(PLAYER, HOME);
		expect(p.clanChampionshipPiece.deleteMany).not.toHaveBeenCalled();
	});
	it('does nothing without live match', async () => {
		setup(null);
		await removePlayerFromBoards(PLAYER, HOME);
		expect(p.$transaction).not.toHaveBeenCalled();
	});
});
