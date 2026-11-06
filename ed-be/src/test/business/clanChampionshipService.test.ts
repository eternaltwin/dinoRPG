import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ playerHasRightRequest: vi.fn() }));
vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() }, LOGGER: { error: vi.fn() } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		$queryRaw: vi.fn(),
		$executeRaw: vi.fn(),
		clanEvent: { create: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
		clanChampionshipRegistration: { create: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn(), findFirst: vi.fn() },
		clanChampionshipMatch: { findMany: vi.fn(), createMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
		clanWar: { findFirst: vi.fn() },
		clan: { findUniqueOrThrow: vi.fn() }
	}
}));

import { Prisma } from '@drpg/prisma';
import { DISCORD, LOGGER } from '../../context.js';
import { scheduleJob } from 'node-schedule';
import { prisma } from '../../prisma.js';
import { auth } from '../../dao/playerDao.js';
import { playerHasRightRequest } from '../../dao/clansDao.js';
import {
	closeRegistrations,
	finishChampionship,
	isClanInActiveChampionship,
	openChampionshipRegistrations,
	startChampionshipMatches,
	scheduleClanChampionship,
	getCurrentChampionship,
	registerClan,
	startClanChampionship,
	unregisterClan
} from '../../business/clanChampionshipService.js';

const p = prisma as any;
const authed = { id: 'player-1', clanId: 7 };
const registrationEnd = new Date('2026-11-23T00:00:00.000Z');

function activeEvent(overrides: Record<string, unknown> = {}) {
	return {
		id: 'ev-1',
		eventType: 'championship',
		startDate: new Date('2026-11-09T00:00:00.000Z'),
		endDate: registrationEnd,
		config: JSON.stringify({
			eventType: 'championship',
			places: [PlaceEnum.DINOVILLE],
			registrationEnd: registrationEnd.toISOString(),
			phase: 'registration'
		}),
		...overrides
	};
}

beforeEach(() => {
	vi.resetAllMocks();
	vi.mocked(auth).mockResolvedValue(authed as any);
	vi.mocked(playerHasRightRequest).mockResolvedValue(true as any);
	p.$transaction.mockImplementation(async (fn: any) => fn(p));
	p.clanEvent.findFirst.mockResolvedValue(null);
	p.clanEvent.findUnique.mockResolvedValue(activeEvent());
	p.clanChampionshipMatch.findMany.mockResolvedValue([]);
});

afterEach(() => {
	vi.useRealTimers();
});

describe('startClanChampionship', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-02T10:00:00.000Z'));
		p.clanEvent.create.mockResolvedValue({ id: 'ev-1' });
	});

	const start = (body: unknown) => startClanChampionship(makeRequest({ body: body as any }));

	it('rejects a start date that is not a Monday', async () => {
		await expect(start({ start: '2026-11-08', places: [PlaceEnum.DINOVILLE] })).rejects.toThrow(
			'clanChampionship.notMonday'
		);
	});

	it('rejects a past Monday', async () => {
		await expect(start({ start: '2026-10-26', places: [PlaceEnum.DINOVILLE] })).rejects.toThrow(
			'clanChampionship.startInPast'
		);
	});

	it('accepts the current Monday', async () => {
		await expect(start({ start: '2026-11-02', places: [PlaceEnum.DINOVILLE] })).resolves.toEqual({ id: 'ev-1' });
	});

	it('rejects empty places', async () => {
		await expect(start({ start: '2026-11-09', places: [] })).rejects.toThrow('clanChampionship.noPlaces');
	});

	it('rejects only invalid places', async () => {
		await expect(start({ start: '2026-11-09', places: [-5, 99999] })).rejects.toThrow('clanChampionship.noPlaces');
	});

	it('propagates the clan event overlap', async () => {
		p.clanEvent.findFirst.mockResolvedValue({ id: 'other' });
		await expect(start({ start: '2026-11-09', places: [PlaceEnum.DINOVILLE] })).rejects.toThrow('clanEvent.overlap');
	});

	it('takes the advisory lock inside the transaction before the overlap check, and schedules after commit', async () => {
		await start({ start: '2026-11-09', places: [PlaceEnum.DINOVILLE] });
		expect(p.$transaction).toHaveBeenCalled();
		const lockOrder = p.$executeRaw.mock.invocationCallOrder[0];
		expect(lockOrder).toBeLessThan(p.clanEvent.findFirst.mock.invocationCallOrder[0]);
		expect(lockOrder).toBeLessThan(p.clanEvent.create.mock.invocationCallOrder[0]);
		expect(p.$transaction.mock.invocationCallOrder[0]).toBeLessThan(lockOrder);
		expect(vi.mocked(scheduleJob).mock.invocationCallOrder[0]).toBeGreaterThan(
			p.clanEvent.create.mock.invocationCallOrder[0]
		);
	});

	it('creates the event and schedules the close job', async () => {
		const result = await start({ start: '2026-11-09', places: [PlaceEnum.DINOVILLE, -5] });
		expect(result).toEqual({ id: 'ev-1' });
		const data = p.clanEvent.create.mock.calls[0][0].data;
		expect(data.eventType).toBe('championship');
		expect(data.startDate).toEqual(new Date('2026-11-09T00:00:00.000Z'));
		expect(data.endDate).toEqual(registrationEnd);
		expect(JSON.parse(data.config)).toEqual({
			eventType: 'championship',
			places: [PlaceEnum.DINOVILLE],
			registrationEnd: registrationEnd.toISOString(),
			phase: 'registration'
		});
		expect(scheduleJob).toHaveBeenCalledWith('championshipClose_ev-1', registrationEnd, expect.any(Function));
	});
});

describe('registerClan', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-10T10:00:00.000Z'));
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanWar.findFirst.mockResolvedValue(null);
		p.clan.findUniqueOrThrow.mockResolvedValue({ name: 'Seven' });
	});

	const register = () => registerClan(makeRequest());

	it('rejects without clan', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'player-1', clanId: null } as any);
		await expect(register()).rejects.toThrow('noClan');
	});

	it('rejects without right', async () => {
		vi.mocked(playerHasRightRequest).mockResolvedValue(false as any);
		await expect(register()).rejects.toThrow('noRight');
		expect(playerHasRightRequest).toHaveBeenCalledWith(7, 'player-1', ClanMemberRight.WAR_OFFICER);
	});

	it('rejects when there is no active championship', async () => {
		p.clanEvent.findFirst.mockResolvedValue(null);
		await expect(register()).rejects.toThrow('clanChampionship.notInRegistration');
	});

	it('rejects once registration is over', async () => {
		vi.setSystemTime(registrationEnd);
		await expect(register()).rejects.toThrow('clanChampionship.notInRegistration');
	});

	it('rejects when the championship is running', async () => {
		p.clanEvent.findFirst.mockResolvedValue(
			activeEvent({
				config: JSON.stringify({ eventType: 'championship', places: [], registrationEnd: '', phase: 'running' })
			})
		);
		await expect(register()).rejects.toThrow('clanChampionship.notInRegistration');
	});

	it('rejects registration before the start date (outside and inside the transaction)', async () => {
		vi.setSystemTime(new Date('2026-11-05T10:00:00.000Z'));
		await expect(register()).rejects.toThrow('clanChampionship.notInRegistration');
		expect(p.$transaction).not.toHaveBeenCalled();
		vi.setSystemTime(new Date('2026-11-10T10:00:00.000Z'));
		p.clanEvent.findUnique.mockResolvedValue(activeEvent({ startDate: new Date('2026-11-11T00:00:00.000Z') }));
		await expect(register()).rejects.toThrow('clanChampionship.notInRegistration');
		expect(p.clanChampionshipRegistration.create).not.toHaveBeenCalled();
	});

	it('rejects a clan with a war in progress', async () => {
		p.clanWar.findFirst.mockResolvedValue({ id: 'war' });
		await expect(register()).rejects.toThrow('clanChampionship.clanAtWar');
		expect(p.clanWar.findFirst.mock.calls[0][0].where).toEqual({
			winnerClanId: null,
			OR: [{ attackerClanId: 7 }, { defenderClanId: 7 }]
		});
	});

	it('locks the event row then re-validates inside the transaction', async () => {
		p.clanEvent.findUnique.mockResolvedValue(
			activeEvent({
				config: JSON.stringify({
					eventType: 'championship',
					places: [],
					registrationEnd: registrationEnd.toISOString(),
					phase: 'running'
				})
			})
		);
		await expect(register()).rejects.toThrow('clanChampionship.notInRegistration');
		expect(p.$queryRaw).toHaveBeenCalled();
		expect(p.clanChampionshipRegistration.create).not.toHaveBeenCalled();
	});

	it('rejects inside the transaction when the deadline has passed meanwhile', async () => {
		p.clanEvent.findUnique.mockResolvedValue(
			activeEvent({
				config: JSON.stringify({
					eventType: 'championship',
					places: [],
					registrationEnd: '2026-11-10T09:00:00.000Z',
					phase: 'registration'
				})
			})
		);
		await expect(register()).rejects.toThrow('clanChampionship.notInRegistration');
	});

	it('maps a concurrent duplicate (P2002) to alreadyRegistered', async () => {
		p.clanChampionshipRegistration.create.mockRejectedValue(
			new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' })
		);
		await expect(register()).rejects.toThrow('clanChampionship.alreadyRegistered');
	});

	it('creates the registration', async () => {
		await register();
		expect(p.clanChampionshipRegistration.create).toHaveBeenCalledWith({
			data: { eventId: 'ev-1', clanId: 7, clanName: 'Seven', registeredById: 'player-1' }
		});
	});
});

describe('unregisterClan', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-10T10:00:00.000Z'));
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanChampionshipRegistration.deleteMany.mockResolvedValue({ count: 1 });
	});

	it('rejects after registration end', async () => {
		vi.setSystemTime(registrationEnd);
		await expect(unregisterClan(makeRequest())).rejects.toThrow('clanChampionship.notInRegistration');
	});

	it('rejects inside the transaction when the phase changed meanwhile', async () => {
		p.clanEvent.findUnique.mockResolvedValue(
			activeEvent({
				config: JSON.stringify({
					eventType: 'championship',
					places: [],
					registrationEnd: registrationEnd.toISOString(),
					phase: 'cancelled'
				})
			})
		);
		await expect(unregisterClan(makeRequest())).rejects.toThrow('clanChampionship.notInRegistration');
		expect(p.clanChampionshipRegistration.deleteMany).not.toHaveBeenCalled();
	});

	it('rejects when not registered (count 0)', async () => {
		p.clanChampionshipRegistration.deleteMany.mockResolvedValue({ count: 0 });
		await expect(unregisterClan(makeRequest())).rejects.toThrow('clanChampionship.notRegistered');
	});

	it('deletes the registration', async () => {
		await unregisterClan(makeRequest());
		expect(p.$queryRaw).toHaveBeenCalled();
		expect(p.clanChampionshipRegistration.deleteMany).toHaveBeenCalledWith({ where: { eventId: 'ev-1', clanId: 7 } });
	});
});

describe('getCurrentChampionship', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-10T10:00:00.000Z'));
		p.clanChampionshipRegistration.findMany.mockResolvedValue([{ clanId: 7, clanName: 'Seven' }]);
		p.clanChampionshipMatch.findMany.mockResolvedValue([]);
	});

	it('returns the active championship with caller flags', async () => {
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		const dto = await getCurrentChampionship(makeRequest());
		expect(dto).toMatchObject({
			id: 'ev-1',
			phase: 'registration',
			registrationStart: new Date('2026-11-09T00:00:00.000Z'),
			registrationEnd,
			places: [PlaceEnum.DINOVILLE],
			registrations: [{ clanId: 7, clanName: 'Seven' }],
			matches: [],
			myClanRegistered: true,
			canManageRegistration: true
		});
	});

	it('maps a match whose clan was deleted to a null id with the snapshot name', async () => {
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanChampionshipMatch.findMany.mockResolvedValue([
			{
				id: 'm1',
				round: 0,
				homeClanId: null,
				homeClanName: 'Gone',
				awayClanId: 7,
				awayClanName: 'Seven',
				placeId: null,
				status: 'scheduled',
				homeScore: 0,
				awayScore: 0,
				winnerClanId: null,
				startsAt: new Date('2026-11-23T18:00:00.000Z'),
				endsAt: new Date('2026-11-24T18:00:00.000Z')
			}
		]);
		const dto = await getCurrentChampionship(makeRequest());
		expect(dto?.matches[0]).toMatchObject({
			homeClan: { id: null, name: 'Gone' },
			awayClan: { id: 7, name: 'Seven' },
			placeId: null,
			status: 'scheduled'
		});
	});

	const matchRow = (over: Record<string, unknown>) => ({
		id: 'm',
		round: 0,
		homeClanId: 7,
		homeClanName: 'Seven',
		awayClanId: 8,
		awayClanName: 'Eight',
		placeId: 5,
		status: 'scheduled',
		homeScore: 0,
		awayScore: 0,
		winnerClanId: null,
		startsAt: new Date('2026-11-23T18:00:00.000Z'),
		endsAt: new Date('2026-11-24T18:00:00.000Z'),
		...over
	});

	it('returns the standings computed from the matches', async () => {
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanChampionshipMatch.findMany.mockResolvedValue([
			matchRow({ status: 'finished', homeScore: 6, awayScore: 2, winnerClanId: 7 })
		]);
		const dto = await getCurrentChampionship(makeRequest());
		expect(dto?.standings[0]).toMatchObject({ clanName: 'Seven', points: 3, rank: 1 });
	});

	it("hides the place of a scheduled match the reader's clan does not play", async () => {
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanChampionshipMatch.findMany.mockResolvedValue([
			matchRow({ id: 'a' }),
			matchRow({ id: 'b', homeClanId: 9, homeClanName: 'Nine', awayClanId: 10, awayClanName: 'Ten', placeId: 6 }),
			matchRow({
				id: 'c',
				homeClanId: 9,
				homeClanName: 'Nine',
				awayClanId: 10,
				awayClanName: 'Ten',
				placeId: 6,
				status: 'finished'
			})
		]);
		const dto = await getCurrentChampionship(makeRequest());
		expect(dto?.matches.map(m => m.placeId)).toEqual([5, null, 6]);
	});

	it('works for a caller without clan', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'player-1', clanId: null } as any);
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		const dto = await getCurrentChampionship(makeRequest());
		expect(dto).toMatchObject({ myClanRegistered: false, canManageRegistration: false });
		expect(playerHasRightRequest).not.toHaveBeenCalled();
	});

	it('falls back to a championship ended less than 7 days ago', async () => {
		const done = activeEvent({
			config: JSON.stringify({
				eventType: 'championship',
				places: [],
				registrationEnd: registrationEnd.toISOString(),
				phase: 'finished'
			}),
			endDate: new Date('2026-11-05T00:00:00.000Z')
		});
		p.clanEvent.findFirst.mockResolvedValueOnce(done).mockResolvedValueOnce(done);
		const dto = await getCurrentChampionship(makeRequest());
		expect(dto?.phase).toBe('finished');
	});

	it('returns null for an older championship', async () => {
		const old = activeEvent({
			config: JSON.stringify({
				eventType: 'championship',
				places: [],
				registrationEnd: registrationEnd.toISOString(),
				phase: 'finished'
			}),
			endDate: new Date('2026-11-01T00:00:00.000Z')
		});
		p.clanEvent.findFirst.mockResolvedValueOnce(old).mockResolvedValueOnce(old);
		expect(await getCurrentChampionship(makeRequest())).toBeNull();
	});

	it('returns null when there is no championship', async () => {
		expect(await getCurrentChampionship(makeRequest())).toBeNull();
	});
});

describe('closeRegistrations', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-23T00:00:01.000Z'));
	});

	const regs = (n: number) => Array.from({ length: n }, (_, i) => ({ clanId: i + 1, clanName: `Clan ${i + 1}` }));

	it('cancels with fewer than 2 registrations', async () => {
		p.clanChampionshipRegistration.findMany.mockResolvedValue(regs(1));
		await closeRegistrations('ev-1');
		expect(p.clanChampionshipMatch.createMany).not.toHaveBeenCalled();
		const arg = p.clanEvent.update.mock.calls[0][0];
		expect(JSON.parse(arg.data.config).phase).toBe('cancelled');
		expect(arg.data.endDate).toEqual(new Date('2026-11-23T00:00:01.000Z'));
		expect(scheduleJob).not.toHaveBeenCalled();
	});

	it('cancels when fewer than 2 registrations still have a live clan', async () => {
		p.clanChampionshipRegistration.findMany.mockResolvedValue([
			{ clanId: 1, clanName: 'Clan 1' },
			{ clanId: null, clanName: 'Gone' }
		]);
		await closeRegistrations('ev-1');
		expect(p.clanChampionshipMatch.createMany).not.toHaveBeenCalled();
		expect(JSON.parse(p.clanEvent.update.mock.calls[0][0].data.config).phase).toBe('cancelled');
		expect(scheduleJob).not.toHaveBeenCalled();
	});

	it('builds the calendar with 4 registrations', async () => {
		p.clanChampionshipRegistration.findMany.mockResolvedValue(regs(4));
		await closeRegistrations('ev-1');
		const matches = p.clanChampionshipMatch.createMany.mock.calls[0][0].data;
		expect(matches).toHaveLength(6);
		for (const m of matches) {
			expect(m.homeClanName).toBe(`Clan ${m.homeClanId}`);
			expect(m.awayClanName).toBe(`Clan ${m.awayClanId}`);
		}
		expect([...new Set(matches.map((m: any) => m.round))]).toEqual([0, 1, 2]);
		expect(matches[0].startsAt).toEqual(new Date('2026-11-23T18:00:00.000Z'));
		const arg = p.clanEvent.update.mock.calls[0][0];
		expect(JSON.parse(arg.data.config).phase).toBe('running');
		expect(arg.data.endDate).toEqual(new Date('2026-12-02T18:00:00.000Z'));
		expect(scheduleJob).not.toHaveBeenCalled();
	});

	it('draws the place of the round-0 matches only', async () => {
		p.clanChampionshipRegistration.findMany.mockResolvedValue(regs(4));
		p.clanChampionshipMatch.findMany.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);
		await closeRegistrations('ev-1');
		expect(p.clanChampionshipMatch.findMany).toHaveBeenCalledWith({ where: { eventId: 'ev-1', round: 0 } });
		const updates = p.clanChampionshipMatch.update.mock.calls.map((c: any) => c[0]);
		expect(updates.map((u: any) => u.where.id)).toEqual(['m1', 'm2']);
		for (const u of updates) expect([PlaceEnum.DINOVILLE]).toContain(u.data.placeId);
	});

	it('does nothing when the championship is not in registration', async () => {
		p.clanEvent.findUnique.mockResolvedValue(
			activeEvent({
				config: JSON.stringify({
					eventType: 'championship',
					places: [],
					registrationEnd: registrationEnd.toISOString(),
					phase: 'running'
				})
			})
		);
		await closeRegistrations('ev-1');
		expect(p.clanEvent.update).not.toHaveBeenCalled();
		expect(p.clanChampionshipMatch.createMany).not.toHaveBeenCalled();
	});
});

describe('openChampionshipRegistrations', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-06T10:00:00.000Z'));
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
	});
	const open = () => openChampionshipRegistrations(makeRequest({}));

	it('sets startDate to now under the event lock and keeps registrationEnd', async () => {
		await open();
		expect(p.$queryRaw).toHaveBeenCalled();
		const arg = p.clanEvent.update.mock.calls[0][0];
		expect(arg.where).toEqual({ id: 'ev-1' });
		expect(arg.data).toEqual({ startDate: new Date('2026-11-06T10:00:00.000Z') });
	});

	it('rejects when there is no active championship', async () => {
		p.clanEvent.findFirst.mockResolvedValue(null);
		await expect(open()).rejects.toThrow('clanChampionship.noActive');
	});

	it('rejects when registrations are already open', async () => {
		const event = activeEvent({ startDate: new Date('2026-11-04T00:00:00.000Z') });
		p.clanEvent.findFirst.mockResolvedValue(event);
		p.clanEvent.findUnique.mockResolvedValue(event);
		await expect(open()).rejects.toThrow('clanChampionship.registrationsAlreadyOpen');
		expect(p.clanEvent.update).not.toHaveBeenCalled();
	});

	it('rejects when the championship is running', async () => {
		const event = activeEvent({
			config: JSON.stringify({
				eventType: 'championship',
				places: [PlaceEnum.DINOVILLE],
				registrationEnd: registrationEnd.toISOString(),
				phase: 'running'
			})
		});
		p.clanEvent.findFirst.mockResolvedValue(event);
		p.clanEvent.findUnique.mockResolvedValue(event);
		await expect(open()).rejects.toThrow('clanChampionship.notInRegistration');
		expect(p.clanEvent.update).not.toHaveBeenCalled();
	});
});

describe('startChampionshipMatches', () => {
	const now = new Date('2026-11-06T14:37:00.000Z');
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
	});
	const startMatches = () => startChampionshipMatches(makeRequest({}));
	const regs = (n: number) => Array.from({ length: n }, (_, i) => ({ clanId: i + 1, clanName: `Clan ${i + 1}` }));

	it('refuses under 2 clans and leaves the championship open', async () => {
		p.clanChampionshipRegistration.findMany.mockResolvedValue(regs(1));
		await expect(startMatches()).rejects.toThrow('clanChampionship.notEnoughClans');
		expect(p.clanEvent.update).not.toHaveBeenCalled();
		expect(p.clanChampionshipMatch.createMany).not.toHaveBeenCalled();
	});

	it('does not count registrations whose clan is gone', async () => {
		p.clanChampionshipRegistration.findMany.mockResolvedValue([
			{ clanId: 1, clanName: 'Clan 1' },
			{ clanId: null, clanName: 'Gone' }
		]);
		await expect(startMatches()).rejects.toThrow('clanChampionship.notEnoughClans');
	});

	it('builds the calendar from now, updates registrationEnd and draws the round-0 place', async () => {
		p.clanChampionshipRegistration.findMany.mockResolvedValue(regs(4));
		p.clanChampionshipMatch.findMany.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);
		await startMatches();
		const matches = p.clanChampionshipMatch.createMany.mock.calls[0][0].data;
		expect(matches).toHaveLength(6);
		expect(matches[0].startsAt).toEqual(now);
		expect(matches[0].endsAt).toEqual(new Date('2026-11-08T14:37:00.000Z'));
		const arg = p.clanEvent.update.mock.calls[0][0];
		const config = JSON.parse(arg.data.config);
		expect(config.phase).toBe('running');
		expect(config.registrationEnd).toBe(now.toISOString());
		expect(arg.data.endDate).toEqual(new Date('2026-11-15T14:37:00.000Z'));
		expect(p.clanChampionshipMatch.findMany).toHaveBeenCalledWith({ where: { eventId: 'ev-1', round: 0 } });
		expect(p.clanChampionshipMatch.update.mock.calls.map((c: any) => c[0].where.id)).toEqual(['m1', 'm2']);
	});

	it('rejects outside the registration phase', async () => {
		const event = activeEvent({
			config: JSON.stringify({
				eventType: 'championship',
				places: [PlaceEnum.DINOVILLE],
				registrationEnd: registrationEnd.toISOString(),
				phase: 'running'
			})
		});
		p.clanEvent.findFirst.mockResolvedValue(event);
		p.clanEvent.findUnique.mockResolvedValue(event);
		await expect(startMatches()).rejects.toThrow('clanChampionship.notInRegistration');
		expect(p.clanChampionshipMatch.createMany).not.toHaveBeenCalled();
	});

	it('makes the already scheduled close job a no-op afterwards', async () => {
		const running = activeEvent({
			config: JSON.stringify({
				eventType: 'championship',
				places: [PlaceEnum.DINOVILLE],
				registrationEnd: now.toISOString(),
				phase: 'running'
			})
		});
		p.clanEvent.findUnique.mockResolvedValue(running);
		await closeRegistrations('ev-1');
		expect(p.clanEvent.update).not.toHaveBeenCalled();
		expect(p.clanChampionshipMatch.createMany).not.toHaveBeenCalled();
	});
});

describe('finishChampionship', () => {
	it('moves running to finished', async () => {
		p.clanEvent.findUnique.mockResolvedValue(
			activeEvent({
				config: JSON.stringify({
					eventType: 'championship',
					places: [],
					registrationEnd: registrationEnd.toISOString(),
					phase: 'running'
				})
			})
		);
		await finishChampionship('ev-1');
		expect(JSON.parse(p.clanEvent.update.mock.calls[0][0].data.config).phase).toBe('finished');
	});
	it('ignores other phases', async () => {
		await finishChampionship('ev-1');
		expect(p.clanEvent.update).not.toHaveBeenCalled();
	});
});

describe('scheduleClanChampionship', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-20T00:00:00.000Z'));
		p.clanChampionshipRegistration.findMany.mockResolvedValue([]);
	});

	it('schedules the close job when registrationEnd is in the future', async () => {
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		await scheduleClanChampionship();
		expect(scheduleJob).toHaveBeenCalledWith('championshipClose_ev-1', registrationEnd, expect.any(Function));
	});

	it('closes immediately when registrationEnd is past', async () => {
		vi.setSystemTime(new Date('2026-11-24T00:00:00.000Z'));
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		await scheduleClanChampionship();
		expect(scheduleJob).not.toHaveBeenCalled();
		expect(JSON.parse(p.clanEvent.update.mock.calls[0][0].data.config).phase).toBe('cancelled');
	});

	it('arms no job for a running championship (the tick drives it)', async () => {
		p.clanEvent.findFirst.mockResolvedValue(
			activeEvent({
				config: JSON.stringify({
					eventType: 'championship',
					places: [],
					registrationEnd: registrationEnd.toISOString(),
					phase: 'running'
				})
			})
		);
		await scheduleClanChampionship();
		expect(scheduleJob).not.toHaveBeenCalled();
		expect(p.clanEvent.update).not.toHaveBeenCalled();
	});

	it('does nothing without an active championship', async () => {
		await scheduleClanChampionship();
		expect(scheduleJob).not.toHaveBeenCalled();
	});
});

describe('isClanInActiveChampionship', () => {
	it('is true when registered to the active championship', async () => {
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanChampionshipRegistration.findFirst.mockResolvedValue({ id: 1 });
		expect(await isClanInActiveChampionship(7, p)).toBe(true);
	});
	it('is false without an active championship', async () => {
		expect(await isClanInActiveChampionship(7, p)).toBe(false);
	});
	it('is false when not registered', async () => {
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanChampionshipRegistration.findFirst.mockResolvedValue(null);
		expect(await isClanInActiveChampionship(7, p)).toBe(false);
	});
});

describe('scheduled job error handling', () => {
	it('reports a failing close job instead of rejecting', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-20T00:00:00.000Z'));
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.$transaction.mockRejectedValue(new Error('db down'));
		await scheduleClanChampionship();
		const callback = vi.mocked(scheduleJob).mock.calls[0][2] as unknown as () => Promise<void>;
		await expect(callback()).resolves.toBeUndefined();
		expect(DISCORD.sendError).toHaveBeenCalled();
		const sent = vi.mocked(DISCORD.sendError).mock.calls[0][0] as Error;
		expect((sent.cause as Error).message).toBe('db down');
		expect(LOGGER.error).toHaveBeenCalled();
	});

	it('does not throw at boot when the immediate close fails', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-24T00:00:00.000Z'));
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.$transaction.mockRejectedValue(new Error('db down'));
		await expect(scheduleClanChampionship()).resolves.toBeUndefined();
		expect(DISCORD.sendError).toHaveBeenCalled();
	});
});
