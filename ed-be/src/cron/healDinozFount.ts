import cron from 'cron';
import { getAllRestingAtFount, updateDinoz } from '../dao/dinozDao.js';
import { sendDiscord } from '../utils/discord.js';
import dayjs from 'dayjs';

// Truncate table 'player_dinoz_shop' at midnight
const healDinozFount = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * *', async () => {
		sendDiscord(`Start healing dinoz at fountj.`);
		const startTime = dayjs();
		try {
			const dinozList = await getAllRestingAtFount();
			for (const dinoz of dinozList) {
				if (dinoz.life < dinoz.maxLife) {
					await updateDinoz(dinoz.id, { life: Math.min(Math.round(dinoz.life + 5), dinoz.maxLife) });
				}
			}
			const endTime = dayjs();
			sendDiscord(`Healed ${dinozList.length} dinoz at fount. Operation ended in ${endTime.diff(startTime)}ms.`);
			// await heal
		} catch (err) {
			console.error(`Cannot heal resting dinoz: ${err}`);
		}
	});
};

export { healDinozFount };
