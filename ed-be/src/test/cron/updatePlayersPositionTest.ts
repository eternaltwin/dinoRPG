import { CronJob } from 'cron';
import {jest} from '@jest/globals';
import { updatePlayersPosition } from '../../cron/updatePlayersPosition.js';
import { playersToUpdatePoints } from '../data/rankingData.js';
import { player } from '../utils/constants.js';

const RankingDao = require('../../dao/rankingDao.js');

describe('Cron updatePlayersPosition', function () {
	let logSpy: any;
	let errorSpy: any;

	beforeEach(function () {
		logSpy = jest.spyOn(console, 'log');
		errorSpy = jest.spyOn(console, 'error');

		RankingDao.getPlayersPoints = jasmine.createSpy().and.returnValue(playersToUpdatePoints);
		RankingDao.updateRanking = jasmine.createSpy().and.returnValue([]);
	});

	it('Case Nominal', async function () {
		const cronJob: CronJob = await updatePlayersPosition();
		await cronJob.fireOnTick();

		expect(RankingDao.getPlayersPoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updateRanking).toHaveBeenCalledTimes(2);

		expect(RankingDao.updateRanking).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				id: player.id_2,
				sumPosition: 1,
				averagePosition: 1,
				sumPointsDisplayed: 12,
				averagePointsDisplayed: 3,
				dinozCountDisplayed: 4
			})
		);

		expect(RankingDao.updateRanking).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				id: player.id_1,
				sumPosition: 2,
				averagePosition: 2,
				sumPointsDisplayed: 11,
				averagePointsDisplayed: 2,
				dinozCountDisplayed: 7
			})
		);

		expect(logSpy).toHaveBeenCalledWith('Ranking updated');
	});

	it('Error case', async function () {
		RankingDao.getPlayersPoints = jasmine.createSpy().and.throwError('Error');

		const cronJob: CronJob = await updatePlayersPosition();
		await cronJob.fireOnTick();

		expect(RankingDao.getPlayersPoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updateRanking).not.toHaveBeenCalled();

		expect(errorSpy).toHaveBeenCalledWith('Cannot update table ranking');
	});
});
