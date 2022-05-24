import { CronJob } from 'cron';
import { resetDinozShopAtMidnight } from '../../cron/resetDinozShop';
import { DinozShop } from '../../models';

describe('Cron resetDinozShopAtMidnight', function () {
	let logSpy: any;
	let errorSpy: any;

	beforeEach(function () {
		logSpy = jest.spyOn(console, 'log');
		errorSpy = jest.spyOn(console, 'error');
	});

	it('Nominal case', async function () {
		DinozShop.destroy = jasmine.createSpy().and.returnValue(true);

		const cronJob: CronJob = await resetDinozShopAtMidnight();
		cronJob.fireOnTick();

		expect(logSpy).toBeCalledWith({ status: true });
	});

	it('Error while deleting table', async function () {
		DinozShop.destroy = jasmine.createSpy().and.throwError('Error');

		const cronJob: CronJob = await resetDinozShopAtMidnight();
		cronJob.fireOnTick();

		expect(errorSpy).toBeCalledWith('Cannot truncate table tb_dinoz_shop, err : Error: Error');
	});
});
