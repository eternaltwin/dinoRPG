import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClanEventType } from '@drpg/prisma';

vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({
	prisma: { clanEvent: { findFirst: vi.fn() } }
}));

import { prisma } from '../../prisma.js';
import {
	assertNoClanEventOverlap,
	findActiveChampionshipEvent,
	findActiveWarEvent,
	parseEventConfig,
	WAR_EVENT_TYPES
} from '../../business/clanEventService.js';

const findFirst = prisma.clanEvent.findFirst as unknown as ReturnType<typeof vi.fn>;
const championship = (phase: string, endDate = new Date('2020-01-01')) => ({
	id: 'c1',
	eventType: ClanEventType.championship,
	startDate: new Date('2019-12-01'),
	endDate,
	config: JSON.stringify({ eventType: 'championship', places: [], registrationEnd: '2020-01-01', phase })
});

describe('clanEventService', () => {
	beforeEach(() => vi.resetAllMocks());

	it('WAR_EVENT_TYPES contains war and mana_war', () => {
		expect(WAR_EVENT_TYPES).toEqual([ClanEventType.war, ClanEventType.mana_war]);
	});

	it('findActiveWarEvent filters on war types and dates', async () => {
		findFirst.mockResolvedValue(null);
		await findActiveWarEvent();
		const where = findFirst.mock.calls[0][0].where;
		expect(JSON.stringify(where)).toContain('"in":["war","mana_war"]');
		expect(where.AND).toBeDefined();
	});

	it('parseEventConfig parses JSON', () => {
		expect(parseEventConfig({ config: '{"phase":"running"}' })).toEqual({ phase: 'running' });
	});

	it('findActiveChampionshipEvent returns the latest championship in registration/running', async () => {
		findFirst.mockResolvedValue(championship('running'));
		expect(await findActiveChampionshipEvent()).not.toBeNull();
		expect(findFirst.mock.calls[0][0]).toMatchObject({
			where: { eventType: ClanEventType.championship },
			orderBy: { startDate: 'desc' }
		});
	});

	it('findActiveChampionshipEvent ignores finished/cancelled', async () => {
		findFirst.mockResolvedValue(championship('finished'));
		expect(await findActiveChampionshipEvent()).toBeNull();
	});

	it('assertNoClanEventOverlap throws when an event ends after start', async () => {
		findFirst.mockResolvedValueOnce({ id: 'e' });
		await expect(assertNoClanEventOverlap(new Date())).rejects.toThrow('clanEvent.overlap');
		expect(findFirst.mock.calls[0][0].where).toEqual({ endDate: { gt: expect.any(Date) } });
	});

	it('assertNoClanEventOverlap throws for a championship still in registration with past endDate', async () => {
		findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(championship('registration'));
		await expect(assertNoClanEventOverlap(new Date())).rejects.toThrow('clanEvent.overlap');
	});

	it('assertNoClanEventOverlap passes otherwise', async () => {
		findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(championship('finished'));
		await expect(assertNoClanEventOverlap(new Date())).resolves.toBeUndefined();
	});
});
