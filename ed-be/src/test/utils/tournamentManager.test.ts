import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';

vi.mock('../../context.js', () => ({
	LOGGER: { log: vi.fn(), error: vi.fn() },
	DISCORD: { sendNewsNotification: vi.fn() }
}));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('../../business/tournamentService.js', () => ({ getNewLevelLimits: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozForDojoFight: vi.fn(), selectDinozForDojoFight: vi.fn() }));
vi.mock('../../dao/playerRewardsDao.js', () => ({ addRewardToPlayer: vi.fn() }));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn() }));
vi.mock('../../dao/newsDao.js', () => ({ createNews: vi.fn() }));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../utils/rewarder.js', () => ({ rewarder: vi.fn() }));
vi.mock('../../utils/tournament.cache.js', () => ({ invalidateTournamentCache: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ translateTarget: (k: string) => k, default: (k: string) => k }));
vi.mock('node-schedule', () => {
	const job = { cancel: vi.fn(), schedule: vi.fn() };
	return { scheduleJob: vi.fn(), scheduledJobs: new Proxy({}, { get: () => job }) };
});

import TournamentManager from '../../utils/tournamentManager.js';

type MockPrisma = Record<string, Record<string, ReturnType<typeof vi.fn>>>;
function mockPrisma(overrides: Partial<MockPrisma> = {}): MockPrisma {
	return {
		tournament: { findFirst: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
		fightArchive: { findFirst: vi.fn(), findMany: vi.fn() },
		dinoz: { updateMany: vi.fn() },
		$queryRaw: vi.fn(),
		...overrides
	} as MockPrisma;
}

beforeEach(() => vi.clearAllMocks());

describe('getCurrentState', () => {
	it('reports the qualification phase for a tournament starting in the future', async () => {
		const manager = new TournamentManager('t1', dayjs().add(2, 'day').toDate());
		const prisma = mockPrisma();
		prisma.tournament.findUnique.mockResolvedValue({ id: 't1', nextRound: new Date() });
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		const state = await manager.getCurrentState(prisma as never);
		expect(state.phase).toBeDefined();
		expect(state.round).toBe(0);
	});
	it('computes the round from the last fight', async () => {
		const manager = new TournamentManager('t1', dayjs().subtract(20, 'day').toDate());
		const prisma = mockPrisma();
		prisma.tournament.findUnique.mockResolvedValue({ id: 't1', nextRound: new Date() });
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 3 });
		const state = await manager.getCurrentState(prisma as never);
		expect(state.round).toBe(4);
	});
	it('throws when the tournament is missing', async () => {
		const manager = new TournamentManager('t1', new Date());
		const prisma = mockPrisma();
		prisma.tournament.findUnique.mockResolvedValue(null);
		await expect(manager.getCurrentState(prisma as never)).rejects.toThrow('non trouvé');
	});
});

describe('getCurrentTournament / getCurrentTournamentState', () => {
	it('returns the full tournament state', async () => {
		const prisma = mockPrisma();
		const t = {
			id: 't1',
			date: dayjs().subtract(1, 'day').toDate(),
			cashPrice: 100,
			levelLimit: 30,
			nextRound: new Date()
		};
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		const result = await TournamentManager.getCurrentTournament(prisma as never);
		expect(result?.id).toBe('t1');
		expect(result?.cashPrice).toBe(100);
		const state = await TournamentManager.getCurrentTournamentState(prisma as never);
		expect(state?.id).toBe('t1');
	});
	it('returns null when no tournament', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.getCurrentTournament(prisma as never)).toBeNull();
	});
});

describe('postponeNextTournamentIfPending', () => {
	it('returns false when no tournament with next round', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.postponeNextTournamentIfPending(prisma as never, new Date())).toBe(false);
	});
	it('postpones when the tournament is over (round 8) and the new date is later', async () => {
		const prisma = mockPrisma();
		const nextRound = dayjs().add(1, 'day').toDate();
		const t = { id: 't1', date: dayjs().subtract(20, 'day').toDate(), nextRound };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 7 });
		const result = await TournamentManager.postponeNextTournamentIfPending(
			prisma as never,
			dayjs().add(5, 'day').toDate()
		);
		expect(result).toBe(true);
		expect(prisma.tournament.update).toHaveBeenCalled();
	});
	it('skips when the tournament is still ongoing', async () => {
		const prisma = mockPrisma();
		const t = { id: 't1', date: dayjs().subtract(1, 'day').toDate(), nextRound: dayjs().add(1, 'day').toDate() };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 1 });
		expect(
			await TournamentManager.postponeNextTournamentIfPending(prisma as never, dayjs().add(5, 'day').toDate())
		).toBe(false);
	});
});

describe('getActiveTeams', () => {
	it('returns winners from the previous round', async () => {
		const prisma = mockPrisma();
		const t = {
			id: 't1',
			date: dayjs().subtract(20, 'day').toDate(),
			cashPrice: 0,
			levelLimit: 30,
			nextRound: new Date()
		};
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 2 });
		prisma.fightArchive.findMany.mockResolvedValue([
			{ tournamentTeamLeftId: 'a', tournamentTeamRightId: 'b', result: true },
			{ tournamentTeamLeftId: 'c', tournamentTeamRightId: null, result: false }
		]);
		const result = await TournamentManager.getActiveTeams(prisma as never);
		expect(result?.winners.length).toBe(2);
	});
	it('returns qualified teams at round 0', async () => {
		const prisma = mockPrisma();
		const t = { id: 't1', date: dayjs().add(2, 'day').toDate(), cashPrice: 0, levelLimit: 30, nextRound: new Date() };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		prisma.tournament.findUniqueOrThrow.mockResolvedValue({ teamSize: 3 });
		prisma.$queryRaw.mockResolvedValue([{ tournamentTeamId: 'x' }]);
		const result = await TournamentManager.getActiveTeams(prisma as never);
		expect(result?.winners).toEqual([{ tournamentTeamId: 'x' }]);
	});
	it('returns null when no tournament', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.getActiveTeams(prisma as never)).toBeNull();
	});
});

describe('resume', () => {
	it('schedules the next round when a future match is pending', async () => {
		const prisma = mockPrisma();
		const t = { id: 't1', date: dayjs().subtract(2, 'day').toDate(), nextRound: dayjs().add(1, 'day').toDate() };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 2 });
		const result = await TournamentManager.resume(prisma as never);
		expect(result).toBeInstanceOf(TournamentManager);
	});
	it('schedules first tournament creation when none exists', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.resume(prisma as never)).toBeNull();
	});
});
