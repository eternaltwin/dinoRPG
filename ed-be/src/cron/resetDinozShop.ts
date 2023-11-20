import cron from 'cron';
import { prisma } from '../prisma.js';

// Truncate table 'player_dinoz_shop' at midnight
const resetDinozShopAtMidnight = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 0 * * *', async () => {
		try {
			await prisma.playerDinozShop.deleteMany();
			console.log({ status: true });
		} catch (err) {
			console.error(`Cannot truncate table tb_dinoz_shop, err : ${err}`);
		}
	});
};

export { resetDinozShopAtMidnight };
