import cron from 'cron';
import { prisma } from '../prisma.js';
import { LOGGER } from '../context.js';
import { UnavailableReason } from '@drpg/prisma';

const unfreezeDinozCron = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 * * * *', async () => {
		try {
			const now = new Date();

			const result = await prisma.dinoz.updateMany({
				where: {
					unavailableReason: UnavailableReason.frozen,
					unfreezeAt: { lte: now } // <= now
				},
				data: {
					unavailableReason: null,
					unfreezeAt: null
				}
			});

			if (result.count > 0) {
				LOGGER.info(`Automatically unfroze ${result.count} dinoz.`);
			}
		} catch (err) {
			LOGGER.error(`Cannot unfreeze dinoz: ${err}`);
		}
	});
};

export { unfreezeDinozCron };
