import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';

vi.mock('../../context.js', () => ({ LOGGER: { log: vi.fn(), error: vi.fn() } }));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn() }));

import ForceBruteManager from '../../utils/forcebruteManager.js';
import { scheduleJob } from 'node-schedule';

function mockPrisma(over: Record<string, unknown> = {}) {
	return {
		fBTournament: { findFirst: vi.fn(), findFirstOrThrow: vi.fn(), create: vi.fn(), update: vi.fn() },
		fightArchive: { findFirst: vi.fn() },
		$executeRaw: vi.fn(),
		...over
	} as never;
}

const activeTournament = (participants = 256, nextRound = new Date()) => ({
	id: 'fb1',
	nextRound,
	date: new Date(),
	_count: { participants }
});

beforeEach(() => vi.clearAllMocks());

describe('getActiveTournament', () => {
	it('returns the active tournament data', async () => {
		const m = new ForceBruteManager(20);
		const prisma = mockPrisma();
		prisma.fBTournament.findFirstOrThrow.mockResolvedValue(activeTournament(100));
		const result = await m.getActiveTournament(prisma);
		expect(result.participants).toBe(100);
		expect(result.id).toBe('fb1');
	});
});

describe('getCurrentState', () => {
	it('reports POOLS phase early with enough participants', async () => {
		const m = new ForceBruteManager(20);
		const prisma = mockPrisma();
		prisma.fBTournament.findFirstOrThrow.mockResolvedValue(activeTournament(256));
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 1 });
		const state = await m.getCurrentState(prisma);
		expect(state.phase).toBe(TournamentPhase.POOLS);
		expect(state.round).toBe(2);
	});
	it('reports FINALS phase in later rounds', async () => {
		const m = new ForceBruteManager(20);
		const prisma = mockPrisma();
		prisma.fBTournament.findFirstOrThrow.mockResolvedValue(activeTournament(256));
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 5 });
		const state = await m.getCurrentState(prisma);
		expect(state.phase).toBe(TournamentPhase.FINALS);
	});
	it('stays in qualification and postpones when not enough participants', async () => {
		const m = new ForceBruteManager(20);
		const prisma = mockPrisma();
		prisma.fBTournament.findFirstOrThrow.mockResolvedValue(activeTournament(10, dayjs().subtract(1, 'day').toDate()));
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		const state = await m.getCurrentState(prisma);
		expect(state.phase).toBe(TournamentPhase.QUALIFICATION);
		expect(prisma.fBTournament.update).toHaveBeenCalled();
	});
});

describe('initializeTournament', () => {
	it('does nothing when a tournament already exists', async () => {
		const m = new ForceBruteManager(20);
		const prisma = mockPrisma();
		prisma.fBTournament.findFirst.mockResolvedValue({ id: 'existing' });
		await m.initializeTournament(prisma);
		expect(prisma.fBTournament.create).not.toHaveBeenCalled();
	});
	it('creates a tournament and notifies players', async () => {
		const m = new ForceBruteManager(20);
		const prisma = mockPrisma();
		prisma.fBTournament.findFirst.mockResolvedValue(null);
		prisma.fBTournament.create.mockResolvedValue({ id: 'fb-new' });
		prisma.$executeRaw.mockResolvedValue(5);
		const result = await m.initializeTournament(prisma);
		expect(result).toEqual({ id: 'fb-new' });
		expect(scheduleJob).toHaveBeenCalled();
	});
});

describe('resume', () => {
	it('schedules the next round during qualification', async () => {
		const m = new ForceBruteManager(20);
		const prisma = mockPrisma();
		prisma.fBTournament.findFirstOrThrow.mockResolvedValue(activeTournament(10, dayjs().add(1, 'day').toDate()));
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		await m.resume(prisma);
		expect(scheduleJob).toHaveBeenCalled();
	});
});
