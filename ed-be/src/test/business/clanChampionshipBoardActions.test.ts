import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() }, LOGGER: { error: vi.fn() } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ playerHasRightRequest: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/serverEventService.js', () => ({
	publishToWsChannel: vi.fn(),
	publishToWsChannelFamily: vi.fn(),
	kickPlayerFromWsChannels: vi.fn()
}));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('../../dao/archiveDao.js', () => ({ archiveFight: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozForChampionshipFight: vi.fn() }));
vi.mock('../../utils/gameConfig.js', () => ({ gameConfig: () => ({ dinoz: { maxLevel: 50 } }) }));
vi.mock('../../dao/clanChampionshipFrameDao.js', () => ({ recordFrame: vi.fn() }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		$queryRaw: vi.fn(),
		clanEvent: { findFirst: vi.fn(), findUnique: vi.fn() },
		clanChampionshipMatch: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
		clanChampionshipPiece: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			count: vi.fn(),
			upsert: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			deleteMany: vi.fn()
		},
		dinoz: { findUnique: vi.fn(), updateMany: vi.fn() },
		clanChampionshipFight: { create: vi.fn() },
		clanMember: { findUnique: vi.fn() }
	}
}));

import { calculateFightBetweenPlayers } from '../../business/fightService.js';
import { archiveFight } from '../../dao/archiveDao.js';
import { getDinozForChampionshipFight } from '../../dao/dinozDao.js';
import { auth } from '../../dao/playerDao.js';
import { LOGGER } from '../../context.js';
import { publishToWsChannel } from '../../business/serverEventService.js';
import { prisma } from '../../prisma.js';
import {
	enterBoard as enterBoardAs,
	leaveBoard as leaveBoardAs,
	moveOnBoard as moveOnBoardAs,
	removePlayerFromBoards,
	sideOf
} from '../../business/clanChampionshipMatchService.js';
import { recordFrame } from '../../dao/clanChampionshipFrameDao.js';

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

const body = (b: Record<string, unknown>) => b as { dinozId: number; direction: BoardDirection };
const enterBoard = async (b: { dinozId: number }) => enterBoardAs(await auth(makeRequest()), b.dinozId);
const leaveBoard = async (b: { dinozId: number }) => leaveBoardAs(await auth(makeRequest()), b.dinozId);
const moveOnBoard = async (b: { dinozId: number; direction: BoardDirection }) =>
	moveOnBoardAs(await auth(makeRequest()), b.dinozId, b.direction);

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
	p.clanMember.findUnique.mockResolvedValue({ clanId: HOME });
	p.clanChampionshipMatch.update.mockResolvedValue({ version: 7 });
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
		// The replay frame is written at the bumped version, after the piece
		expect(recordFrame).toHaveBeenCalledWith(p, liveMatch().id, 7, [
			{ type: 'enter', dinozId: 5, x: 0, y: call.create.y }
		]);
	});
	it('east clan enters on column 19', async () => {
		vi.mocked(auth).mockResolvedValue({ id: PLAYER, clanId: AWAY } as never);
		p.clanMember.findUnique.mockResolvedValue({ clanId: AWAY });
		await enter();
		expect(p.clanChampionshipPiece.upsert.mock.calls[0][0].create.x).toBe(19);
	});
	it('noLiveMatch when the player left the clan since the match was found', async () => {
		p.clanMember.findUnique.mockResolvedValue(null);
		await expect(enter()).rejects.toThrow('clanChampionship.noLiveMatch');
		p.clanMember.findUnique.mockResolvedValue({ clanId: AWAY });
		await expect(enter()).rejects.toThrow('clanChampionship.noLiveMatch');
		expect(p.clanChampionshipPiece.upsert).not.toHaveBeenCalled();
	});
	it('dinozBusy when the conditional lock matches nothing', async () => {
		p.dinoz.updateMany.mockResolvedValue({ count: 0 });
		await expect(enter()).rejects.toThrow('clanChampionship.dinozBusy');
		expect(p.clanChampionshipPiece.upsert).not.toHaveBeenCalled();
	});
	it('re-entry by a player of the other clan counts the quota and takes over the piece', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'buyer', clanId: AWAY } as never);
		p.clanMember.findUnique.mockResolvedValue({ clanId: AWAY });
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
	it('notYourDinoz when the piece belongs to the other clan', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ clanId: AWAY }));
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
		expect(recordFrame).toHaveBeenCalledWith(p, liveMatch().id, 7, [{ type: 'leave', dinozId: 5 }]);
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
	it('notYourDinoz when the piece belongs to the other clan', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 5, y: 5, clanId: AWAY }));
		await expect(move(BoardDirection.E)).rejects.toThrow('clanChampionship.notYourDinoz');
	});
	it('enemyEntryColumn: west cannot step onto x = 19', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 18, y: 5 }));
		await expect(move(BoardDirection.E)).rejects.toThrow('clanChampionship.enemyEntryColumn');
		expect(p.clanChampionshipPiece.update).not.toHaveBeenCalled();
	});
	it('enemyEntryColumn: east cannot step onto x = 0', async () => {
		vi.mocked(auth).mockResolvedValue({ id: PLAYER, clanId: AWAY } as never);
		p.clanMember.findUnique.mockResolvedValue({ clanId: AWAY });
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ clanId: AWAY, x: 1, y: 5 }));
		await expect(move(BoardDirection.W)).rejects.toThrow('clanChampionship.enemyEntryColumn');
	});
	it('attacking an enemy standing on the enemy entry column is still allowed', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 18, y: 5 }));
		p.clanChampionshipPiece.findMany.mockResolvedValue([{ id: 2, clanId: AWAY, x: 19, y: 5 }]);
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
		expect(r.fight).not.toBeNull();
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
		expect(recordFrame).toHaveBeenCalledWith(p, liveMatch().id, 7, [{ type: 'move', dinozId: 5, x: 6, y: 5 }]);
	});
	it('dinozDead: a piece whose dinoz lost its life off the board cannot move', async () => {
		p.dinoz.findUnique.mockResolvedValue(dinozRow({ life: 0 }));
		await expect(move(BoardDirection.E)).rejects.toThrow('clanChampionship.dinozDead');
		expect(p.clanChampionshipPiece.update).not.toHaveBeenCalled();
	});
	it('takes the pieces at 0 HP off the board before moving, so they neither block nor score', async () => {
		await move(BoardDirection.E);
		expect(p.clanChampionshipPiece.updateMany).toHaveBeenCalledWith({
			where: { matchId: liveMatch().id, state: 'onBoard', dinoz: { life: { lte: 0 } } },
			data: { state: 'dead', x: null, y: null, actionPoints: 0 }
		});
		expect(p.dinoz.updateMany).toHaveBeenCalledWith({
			where: {
				life: { lte: 0 },
				unavailableReason: 'clanChampionship',
				championshipPieces: { some: { matchId: liveMatch().id, state: 'onBoard' } }
			},
			data: { unavailableReason: null }
		});
	});
	it('an enemy target reaches the attack resolution after paying the AP', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([{ id: 2, dinozId: 20, clanId: AWAY, x: 6, y: 5 }]);
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
		expect(recordFrame).toHaveBeenCalledWith(p, liveMatch().id, 7, [
			{ type: 'attack', dinozId: 5, targetDinozId: 20, archiveId: 'arch-1', outcome: 0, deadDinozIds: [] }
		]);
		expect(vi.mocked(archiveFight).mock.calls[0][5]).toBe(p);
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
		expect(recordFrame).toHaveBeenCalledWith(p, liveMatch().id, 7, [{ type: 'withdrawn', dinozIds: [5, 6] }]);
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

describe('board version and realtime publication', () => {
	const matchId = liveMatch().id;
	const bumpCall = {
		where: { id: matchId },
		data: { version: { increment: 1 } },
		select: { version: true }
	};
	const fightSetup = () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 5, y: 5 }));
		p.clanChampionshipPiece.findMany.mockResolvedValue([{ id: 2, clanId: AWAY, x: 6, y: 5 }]);
		vi.mocked(getDinozForChampionshipFight).mockResolvedValue([]);
		vi.mocked(calculateFightBetweenPlayers).mockReturnValue({
			outcome: 0,
			attackers: [],
			defenders: [],
			steps: [],
			fighters: []
		} as never);
		vi.mocked(archiveFight).mockResolvedValue({ id: 'arch-1' } as never);
	};
	const expectPublishedOnce = () => {
		expect(p.clanChampionshipMatch.update).toHaveBeenCalledTimes(1);
		expect(p.clanChampionshipMatch.update).toHaveBeenCalledWith(bumpCall);
		const message = { type: 'boardChanged', matchId, version: 7 };
		expect(publishToWsChannel).toHaveBeenCalledTimes(2);
		expect(publishToWsChannel).toHaveBeenCalledWith(`WsClanForum.${HOME}`, message);
		expect(publishToWsChannel).toHaveBeenCalledWith(`WsClanForum.${AWAY}`, message);
		expect(vi.mocked(publishToWsChannel).mock.invocationCallOrder[0]).toBeGreaterThan(
			p.clanChampionshipMatch.update.mock.invocationCallOrder[0]
		);
	};
	beforeEach(() => setup());

	it('enterBoard bumps the version and publishes once', async () => {
		await enterBoard(body({ dinozId: 5 }));
		expectPublishedOnce();
	});
	it('leaveBoard bumps the version and publishes once', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc());
		await leaveBoard(body({ dinozId: 5 }));
		expectPublishedOnce();
	});
	it('a move bumps the version and publishes once', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc({ x: 5, y: 5 }));
		await moveOnBoard(body({ dinozId: 5, direction: BoardDirection.E }));
		expectPublishedOnce();
	});
	it('a move that triggers a fight bumps once, not once per participant', async () => {
		fightSetup();
		await moveOnBoard(body({ dinozId: 5, direction: BoardDirection.E }));
		expectPublishedOnce();
	});
	it('publishes only after the transaction resolved', async () => {
		let committed = false;
		p.$transaction.mockImplementation(async (cb: any) => {
			const r = await cb(p);
			expect(publishToWsChannel).not.toHaveBeenCalled();
			committed = true;
			return r;
		});
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc());
		await leaveBoard(body({ dinozId: 5 }));
		expect(committed).toBe(true);
		expect(publishToWsChannel).toHaveBeenCalledTimes(2);
	});
	it('a rejected action publishes nothing', async () => {
		await expect(leaveBoard(body({ dinozId: 5 }))).rejects.toThrow('clanChampionship.notOnBoard');
		expect(publishToWsChannel).not.toHaveBeenCalled();
	});
	it('a failure after the bump (transaction rolled back) publishes nothing', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc());
		p.$transaction.mockImplementation(async (cb: any) => {
			await cb(p);
			throw new Error('commit failed');
		});
		await expect(leaveBoard(body({ dinozId: 5 }))).rejects.toThrow('commit failed');
		expect(publishToWsChannel).not.toHaveBeenCalled();
	});
	it('a publishing failure is logged, never thrown', async () => {
		p.clanChampionshipPiece.findUnique.mockResolvedValue(pc());
		vi.mocked(publishToWsChannel).mockImplementationOnce(() => {
			throw new Error('socket down');
		});
		await expect(leaveBoard(body({ dinozId: 5 }))).resolves.toBeUndefined();
		expect(LOGGER.error).toHaveBeenCalled();
	});
	it('removePlayerFromBoards bumps the version and publishes once', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([{ dinozId: 5 }]);
		await removePlayerFromBoards(PLAYER, HOME);
		expectPublishedOnce();
	});
	it('removePlayerFromBoards without pieces changes nothing and publishes nothing', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([]);
		await removePlayerFromBoards(PLAYER, HOME);
		expect(p.clanChampionshipMatch.update).not.toHaveBeenCalled();
		expect(publishToWsChannel).not.toHaveBeenCalled();
	});
});
