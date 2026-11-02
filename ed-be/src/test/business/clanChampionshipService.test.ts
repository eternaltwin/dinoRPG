import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ playerHasRightRequest: vi.fn() }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(),
		clanEvent: { create: vi.fn(), findFirst: vi.fn() },
		clanChampionshipRegistration: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
		clanChampionshipMatch: { findMany: vi.fn() },
		clanWar: { findFirst: vi.fn() }
	}
}));

import { scheduleJob } from 'node-schedule';
import { prisma } from '../../prisma.js';
import { auth } from '../../dao/playerDao.js';
import { playerHasRightRequest } from '../../dao/clansDao.js';
import {
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
		p.clanChampionshipRegistration.findUnique.mockResolvedValue(null);
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

	it('rejects a clan with a war in progress', async () => {
		p.clanWar.findFirst.mockResolvedValue({ id: 'war' });
		await expect(register()).rejects.toThrow('clanChampionship.clanAtWar');
		expect(p.clanWar.findFirst.mock.calls[0][0].where).toEqual({
			winnerClanId: null,
			OR: [{ attackerClanId: 7 }, { defenderClanId: 7 }]
		});
	});

	it('rejects when already registered', async () => {
		p.clanChampionshipRegistration.findUnique.mockResolvedValue({ id: 1 });
		await expect(register()).rejects.toThrow('clanChampionship.alreadyRegistered');
	});

	it('creates the registration', async () => {
		await register();
		expect(p.clanChampionshipRegistration.create).toHaveBeenCalledWith({
			data: { eventId: 'ev-1', clanId: 7, registeredById: 'player-1' }
		});
	});
});

describe('unregisterClan', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-10T10:00:00.000Z'));
		p.clanEvent.findFirst.mockResolvedValue(activeEvent());
		p.clanChampionshipRegistration.findUnique.mockResolvedValue({ id: 1 });
	});

	it('rejects after registration end', async () => {
		vi.setSystemTime(registrationEnd);
		await expect(unregisterClan(makeRequest())).rejects.toThrow('clanChampionship.notInRegistration');
	});

	it('rejects when not registered', async () => {
		p.clanChampionshipRegistration.findUnique.mockResolvedValue(null);
		await expect(unregisterClan(makeRequest())).rejects.toThrow('clanChampionship.notRegistered');
	});

	it('deletes the registration', async () => {
		await unregisterClan(makeRequest());
		expect(p.clanChampionshipRegistration.delete).toHaveBeenCalledWith({
			where: { eventId_clanId: { eventId: 'ev-1', clanId: 7 } }
		});
	});
});

describe('getCurrentChampionship', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-10T10:00:00.000Z'));
		p.clanChampionshipRegistration.findMany.mockResolvedValue([{ clanId: 7, clan: { name: 'Seven' } }]);
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
