import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-schedule', () => ({ scheduleJob: vi.fn() }));
vi.mock('../../context.js', () => ({ LOGGER: { error: vi.fn() } }));

import { scheduleJob as nodeScheduleJob } from 'node-schedule';
import { LOGGER } from '../../context.js';
import { runJobSafely, scheduleJob } from '../../utils/server/safeSchedule.js';

describe('safeSchedule', () => {
	beforeEach(() => vi.clearAllMocks());

	it('logs a rejected job instead of rejecting, which would stop the server', async () => {
		await expect(runJobSafely('offer_1', () => Promise.reject(new Error('db down')))).resolves.toBeUndefined();
		expect(LOGGER.error).toHaveBeenCalledWith(expect.stringContaining('offer_1'));
	});

	it('also catches a job that throws synchronously', async () => {
		await expect(
			runJobSafely('war_1', () => {
				throw new Error('boom');
			})
		).resolves.toBeUndefined();
		expect(LOGGER.error).toHaveBeenCalled();
	});

	it('hands node-schedule a callback that never rejects', async () => {
		const callback = vi.fn().mockRejectedValue(new Error('fail'));
		const date = new Date();
		scheduleJob('job', date, callback);
		const [name, spec, wrapped] = vi.mocked(nodeScheduleJob).mock.calls[0] as unknown as [
			string,
			Date,
			() => Promise<void>
		];
		expect([name, spec]).toEqual(['job', date]);
		await expect(wrapped()).resolves.toBeUndefined();
		expect(callback).toHaveBeenCalled();
	});
});
