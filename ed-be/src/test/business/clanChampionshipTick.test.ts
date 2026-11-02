import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() }, LOGGER: { error: vi.fn() } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ playerHasRightRequest: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		$queryRaw: vi.fn(),
		clanEvent: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
		clanChampionshipMatch: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
		clanChampionshipPiece: { findMany: vi.fn(), updateMany: vi.fn() },
		dinoz: { updateMany: vi.fn() }
	}
}));

import { DISCORD } from '../../context.js';
import { prisma } from '../../prisma.js';
import { championshipTick, startChampionshipTicker } from '../../business/clanChampionshipMatchService.js';

const p = prisma as any;
const HOME = 1;
const AWAY = 2;
const startsAt = new Date('2026-11-23T18:00:00.000Z');
const endsAt = new Date('2026-11-25T18:00:00.000Z');
const min = (n: number) => new Date(startsAt.getTime() + n * 60_000);

function runningEvent() {
	return {
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
}

function match(overrides: Record<string, unknown> = {}) {
	return {
		id: 'a0000000-0000-4000-8000-000000000001',
		eventId: 'ev-1',
		round: 0,
		homeClanId: HOME,
		awayClanId: AWAY,
		startsAt,
		endsAt,
		placeId: 1,
		westClanId: null,
		obstacles: [],
		homeScore: 0,
		awayScore: 0,
		ticksApplied: 0,
		status: 'scheduled',
		winnerClanId: null,
		...overrides
	};
}

const live = (overrides: Record<string, unknown> = {}) => match({ status: 'live', westClanId: HOME, ...overrides });
const piece = (id: number, clanId: number, x: number) => ({ id, dinozId: id * 10, clanId, x, y: id });

/** Single open match: the tick processes it then counts the unfinished ones. */
function setup(m: ReturnType<typeof match>, pieces: any[] = [], remaining = 1) {
	p.clanEvent.findFirst.mockResolvedValue(runningEvent());
	p.clanEvent.findUnique.mockResolvedValue(runningEvent());
	p.clanChampionshipMatch.findMany.mockResolvedValue([{ id: m.id }]);
	p.clanChampionshipMatch.findUnique.mockResolvedValue(m);
	p.clanChampionshipMatch.count.mockResolvedValue(remaining);
	p.clanChampionshipPiece.findMany.mockResolvedValue(pieces);
}

const matchUpdate = () => p.clanChampionshipMatch.update.mock.calls.at(-1)?.[0];

beforeEach(() => {
	vi.resetAllMocks();
	vi.useFakeTimers();
	p.$transaction.mockImplementation(async (fn: any) => fn(p));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('championshipTick', () => {
	it('does nothing without a running championship', async () => {
		await championshipTick(startsAt);
		expect(p.clanChampionshipMatch.findMany).not.toHaveBeenCalled();
	});

	it('draws the place 24 h before startsAt, not before', async () => {
		const round1 = match({
			placeId: null,
			startsAt: new Date('2026-11-26T18:00:00.000Z'),
			endsAt: new Date('2026-11-28T18:00:00.000Z')
		});
		setup(round1);
		await championshipTick(new Date('2026-11-25T17:50:00.000Z'));
		expect(p.clanChampionshipMatch.update).not.toHaveBeenCalled();

		await championshipTick(new Date('2026-11-25T18:00:00.000Z'));
		expect(p.clanChampionshipMatch.update).toHaveBeenCalledWith({
			where: { id: round1.id },
			data: { placeId: expect.any(Number) }
		});
	});

	it('kicks off at startsAt: live, west clan, obstacles', async () => {
		const m = match();
		setup(m);
		await championshipTick(startsAt);
		const { data } = matchUpdate();
		expect(data.status).toBe('live');
		expect([HOME, AWAY]).toContain(data.westClanId);
		expect(data.obstacles.length).toBeGreaterThanOrEqual(40);
		expect(data.obstacles.length).toBeLessThanOrEqual(60);
	});

	it('does not kick off before startsAt', async () => {
		setup(match());
		await championshipTick(min(-1));
		expect(p.clanChampionshipMatch.update).not.toHaveBeenCalled();
	});

	it('is reproducible: same seed gives the same board and side', async () => {
		setup(match());
		await championshipTick(startsAt);
		const first = matchUpdate().data;
		await championshipTick(startsAt);
		expect(matchUpdate().data).toEqual(first);
	});

	it('applies the missed ticks: scores and AP', async () => {
		// home west at x=5 (line 5), away east at x=15 (line 4): nobody passed
		setup(live(), [piece(1, HOME, 5), piece(2, AWAY, 15)]);
		await championshipTick(min(25));
		expect(matchUpdate().data).toEqual({ homeScore: 10, awayScore: 8, ticksApplied: 2 });
		expect(p.clanChampionshipPiece.updateMany).toHaveBeenCalledWith({
			where: { matchId: expect.any(String), state: 'onBoard' },
			data: { actionPoints: { increment: 4 } }
		});
	});

	it('maps the sides when the away clan is west', async () => {
		setup(live({ westClanId: AWAY }), [piece(1, HOME, 15), piece(2, AWAY, 5)]);
		await championshipTick(min(10));
		expect(matchUpdate().data).toEqual({ homeScore: 4, awayScore: 5, ticksApplied: 1 });
	});

	it('applies nothing the second time at the same instant', async () => {
		const m = live();
		setup(m, [piece(1, HOME, 5)]);
		await championshipTick(min(25));
		const applied = matchUpdate().data;
		p.clanChampionshipMatch.update.mockClear();
		p.clanChampionshipPiece.updateMany.mockClear();
		p.clanChampionshipMatch.findUnique.mockResolvedValue({ ...m, ...applied });
		await championshipTick(min(25));
		expect(p.clanChampionshipMatch.update).not.toHaveBeenCalled();
		expect(p.clanChampionshipPiece.updateMany).not.toHaveBeenCalled();
	});

	it('finishes the match: remaining ticks, winner, pieces left, dinoz unlocked', async () => {
		setup(live({ ticksApplied: 280, homeScore: 100, awayScore: 100 }), [piece(1, HOME, 5), piece(2, AWAY, 15)], 0);
		await championshipTick(new Date(endsAt.getTime() + 3 * 3600_000));
		const { data } = matchUpdate();
		expect(data).toMatchObject({ homeScore: 140, awayScore: 132, ticksApplied: 288, winnerClanId: HOME });
		expect(data.status).toBe('finished');
		expect(p.clanChampionshipPiece.updateMany).toHaveBeenCalledWith({
			where: { matchId: expect.any(String), state: 'onBoard' },
			data: { actionPoints: { increment: 16 } }
		});
		expect(p.clanChampionshipPiece.updateMany).toHaveBeenCalledWith({
			where: { matchId: expect.any(String), state: 'onBoard' },
			data: { state: 'left', x: null, y: null }
		});
		expect(p.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: { in: [10, 20] }, unavailableReason: 'clanChampionship' },
			data: { unavailableReason: null }
		});
	});

	it('gives the win to the away clan with the higher score', async () => {
		setup(live({ ticksApplied: 288, homeScore: 1, awayScore: 2 }), [], 0);
		await championshipTick(endsAt);
		expect(matchUpdate().data).toMatchObject({ winnerClanId: AWAY, status: 'finished' });
	});

	it('a draw gives no winner', async () => {
		setup(live({ ticksApplied: 288, homeScore: 3, awayScore: 3 }), [], 0);
		await championshipTick(endsAt);
		expect(matchUpdate().data.winnerClanId).toBeNull();
	});

	it('never scores more than 288 ticks', async () => {
		setup(live({ ticksApplied: 288 }), [piece(1, HOME, 5)], 0);
		await championshipTick(new Date(endsAt.getTime() + 3600_000));
		expect(matchUpdate().data).not.toHaveProperty('ticksApplied');
	});

	it('skips a match already finished under the lock', async () => {
		setup(match({ status: 'finished' }));
		await championshipTick(endsAt);
		expect(p.clanChampionshipMatch.update).not.toHaveBeenCalled();
	});

	it('finishes the championship only when every match is finished', async () => {
		setup(live({ ticksApplied: 288 }), [], 1);
		await championshipTick(endsAt);
		expect(p.clanEvent.update).not.toHaveBeenCalled();

		p.clanChampionshipMatch.count.mockResolvedValue(0);
		await championshipTick(endsAt);
		expect(JSON.parse(p.clanEvent.update.mock.calls[0][0].data.config).phase).toBe('finished');
	});

	it('locks the match before re-reading it', async () => {
		setup(live());
		await championshipTick(startsAt);
		expect(p.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
			p.clanChampionshipMatch.findUnique.mock.invocationCallOrder[0]
		);
	});

	it('a failing match is reported and does not stop the others', async () => {
		const bad = live({ id: 'bad' });
		const good = live({ id: 'good', ticksApplied: 0 });
		setup(good, [piece(1, HOME, 5)]);
		p.clanChampionshipMatch.findMany.mockResolvedValue([{ id: 'bad' }, { id: 'good' }]);
		p.clanChampionshipMatch.findUnique.mockImplementation(async ({ where }: any) => {
			if (where.id === 'bad') throw new Error('boom');
			return good;
		});
		await championshipTick(min(10));
		expect(DISCORD.sendError).toHaveBeenCalledTimes(1);
		expect(matchUpdate().where.id).toBe('good');
		expect(bad.id).toBe('bad');
	});
});

describe('startChampionshipTicker', () => {
	it('builds a stopped 10-minute UTC cron job', () => {
		const job = startChampionshipTicker();
		expect(job.running).toBeFalsy();
	});
});
