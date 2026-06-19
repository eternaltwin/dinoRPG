import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerAction } from '@drpg/prisma';

vi.mock('../../prisma.js', () => ({ prisma: { serverState: { findMany: vi.fn() } } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn() }));
vi.mock('../../cron/midnightReset.js', () => ({ midnightReset: vi.fn() }));
vi.mock('../../cron/healRestingDinoz.js', () => ({ healRestingDinoz: vi.fn() }));

import { prisma } from '../../prisma.js';
import { scheduleJob } from 'node-schedule';
import { midnightReset } from '../../cron/midnightReset.js';
import { healRestingDinoz } from '../../cron/healRestingDinoz.js';
import { scheduleAtStart } from '../../business/scheduleService.js';

beforeEach(() => vi.clearAllMocks());

describe('scheduleAtStart', () => {
	it('runs due actions immediately and schedules future ones', async () => {
		const past = new Date(Date.now() - 100000);
		const future = new Date(Date.now() + 100000000);
		vi.mocked(prisma.serverState.findMany).mockResolvedValue([
			{ action: ServerAction.healRestingDinoz, nextCheck: past },
			{ action: ServerAction.healRestingDinoz, nextCheck: future },
			{ action: ServerAction.midnightReset, nextCheck: past },
			{ action: ServerAction.midnightReset, nextCheck: future },
			{ action: 'unknown', nextCheck: future }
		] as never);
		await scheduleAtStart();
		expect(healRestingDinoz).toHaveBeenCalledTimes(1);
		expect(midnightReset).toHaveBeenCalledTimes(1);
		expect(scheduleJob).toHaveBeenCalledTimes(2);
	});
});
