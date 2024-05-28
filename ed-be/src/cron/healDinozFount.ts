import cron from 'cron';
import { getAllRestingAtFount, updateDinoz } from '../dao/dinozDao.js';
import dayjs from 'dayjs';
import { LOGGER } from '../context.js';

// Truncate table 'player_dinoz_shop' at midnight
const healDinozFount = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * *', async () => {
		const startTime = dayjs();
		try {
			const dinozList = await getAllRestingAtFount();
			for (const dinoz of dinozList) {
				if (dinoz.life < dinoz.maxLife) {
					await updateDinoz(dinoz.id, { life: Math.min(Math.round(dinoz.life + 5), dinoz.maxLife) });
				}
			}
			const endTime = dayjs();
			LOGGER.log(`Healed ${dinozList.length} dinoz at fount. Operation ended in ${endTime.diff(startTime)}ms.`);
			// await heal
		} catch (err) {
			console.error(`Cannot heal resting dinoz: ${err}`);
		}
	});
};

export { healDinozFount };
