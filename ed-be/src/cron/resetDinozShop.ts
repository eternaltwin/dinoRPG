import cron from 'cron';
import { DinozShop } from '../models';

// Truncate table 'tb_dinoz_shop' at midnight
const resetDinozShopAtMidnight = (): void => {
	const CronJob = cron.CronJob;

	const cronjob: cron.CronJob = new CronJob('0 0 0 * * *', function () {
		DinozShop.destroy({ truncate: true, restartIdentity: true })
			.then(() => {
				console.log({ status: true });
			})
			.catch((err) => {
				console.error('Cannot truncate table tb_dinoz_shop, err : ', err);
			});
	});

	cronjob.start();
};

export { resetDinozShopAtMidnight };
