import { Job, scheduleJob as nodeScheduleJob, Spec } from 'node-schedule';

/**
 * Runs a job callback without ever rejecting: node-schedule emits the rejection of a job as an `error` event
 * that nobody listens to, which stops the whole server. The failure is logged instead.
 */
export async function runJobSafely(name: string, callback: () => unknown): Promise<void> {
	try {
		await callback();
	} catch (err) {
		// Loaded on failure only, so that modules scheduling jobs don't load the server context themselves
		const { LOGGER } = await import('../../context.js');
		LOGGER.error(`Scheduled job ${name} failed: ${err instanceof Error ? (err.stack ?? err.message) : err}`);
	}
}

/** `scheduleJob` of node-schedule, whose callback can no longer stop the server when it fails. */
export function scheduleJob(name: string, spec: Spec, callback: () => unknown): Job {
	return nodeScheduleJob(name, spec, () => runJobSafely(name, callback));
}
