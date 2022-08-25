import cron, { CronJob } from 'cron';
import { AppDataSource } from '../data-source.js';
import { PlayerDinozShop } from '../entity/index.js';

// Truncate table 'player_dinoz_shop' at midnight
const resetDinozShopAtMidnight = (): CronJob => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 0 * * *', async () => {
		try {
			await AppDataSource.getRepository(PlayerDinozShop).clear();
			console.log({ status: true });
		} catch (err) {
			console.error(`Cannot truncate table tb_dinoz_shop, err : ${err}`);
		}
	});
};

export { resetDinozShopAtMidnight };
