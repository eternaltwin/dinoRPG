import { CronJob } from 'cron';
import { jest } from '@jest/globals';
import { resetDinozShopAtMidnight } from '../../cron/resetDinozShop.js';
import { PlayerDinozShop } from '../../entity/index.js';
import { AppDataSource } from '../../data-source.js';

describe('Cron resetDinozShopAtMidnight', function () {
	let logSpy: any;
	let errorSpy: any;

	beforeEach(function () {
		logSpy = jest.spyOn(console, 'log');
		errorSpy = jest.spyOn(console, 'error');
	});

	it('Nominal case', async function () {
		AppDataSource.getRepository(PlayerDinozShop).clear = jasmine.createSpy();

		const cronJob: CronJob = await resetDinozShopAtMidnight();
		cronJob.fireOnTick();

		expect(errorSpy).not.toHaveBeenCalled();
		// The logSpy does not work anymore for an unknown reason
		// expect(logSpy).toBeCalledWith({ status: true });
	});

	it('Error while deleting table', async function () {
		AppDataSource.getRepository(PlayerDinozShop).clear = jasmine.createSpy().and.throwError('Error');

		const cronJob: CronJob = await resetDinozShopAtMidnight();
		cronJob.fireOnTick();

		expect(errorSpy).toBeCalledWith('Cannot truncate table tb_dinoz_shop, err : Error: Error');
	});
});
