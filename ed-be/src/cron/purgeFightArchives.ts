import cron from 'cron';
import { LOGGER } from '../context.js';
import { purgeExpiredFightArchives } from '../business/fightArchiveService.js';

/** Every night at midnight, deletes the fight archives past the retention period that no player keeps as a favorite. */
const purgeFightArchives = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * *', async () => {
		try {
			const deleted = await purgeExpiredFightArchives();
			LOGGER.log(`Purged ${deleted} expired fight archives`);
		} catch (err) {
			LOGGER.error(`Cannot purge expired fight archives: ${err}`);
		}
	});
};

export { purgeFightArchives };
