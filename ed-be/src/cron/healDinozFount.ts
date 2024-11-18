import cron from 'cron';
import { prisma } from '../prisma.js';
import dayjs from 'dayjs';
import { LOGGER } from '../context.js';

const healDinozFount = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * *', async () => {
		const startTime = dayjs();
		const lifeIncrement = 5;

		try {
			const fount = await prisma.$executeRaw`
				UPDATE dinoz
				SET life = LEAST(
					life + ${lifeIncrement},
					"maxLife"
				)
				WHERE "placeId" = 7 -- Fontaine de Jouvence
				AND life < "maxLife"
				AND EXISTS (
					SELECT 1
					FROM player p
					JOIN player_reward pr ON pr."playerId" = p.id
					WHERE pr."rewardId" = 1 -- Perle
					AND p.id = dinoz."playerId"
				);
			`;

			const endTime = dayjs();
			LOGGER.log(`Healed ${fount} dinoz at fount. Operation ended in ${endTime.diff(startTime)}ms.`);
		} catch (err) {
			console.error(`Cannot heal resting dinoz: ${err}`);
		}
	});
};

export { healDinozFount };
