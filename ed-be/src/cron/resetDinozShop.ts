import cron, { CronJob } from 'cron';
import { DinozShop } from '../models/index.js';

// Truncate table 'tb_dinoz_shop' at midnight
const resetDinozShopAtMidnight = (): CronJob => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 0 * * *', function () {
		try {
			DinozShop.destroy({ truncate: true, restartIdentity: true });
			console.log({ status: true });
		} catch (err) {
			console.error(`Cannot truncate table tb_dinoz_shop, err : ${err}`);
		}
	});
};

export { resetDinozShopAtMidnight };
