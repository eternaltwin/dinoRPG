import { getRanking } from '../../business/rankingService.js';
import { mockRequest } from '../utils/constants.js';
import { playersRankingAverage, playersRankingSum } from '../data/rankingData.js';
import { Request } from 'express';

const RankingDao = require('../../dao/rankingDao.js');

describe('Function getRanking', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			page: '1'
		};

		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue([]);
		RankingDao.getPlayersAverageRanking = jasmine.createSpy().and.returnValue([]);
	});

	it('Case Sum', async function () {
		req.params = {
			sort: 'classic'
		};
		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue(playersRankingSum);

		try {
			await getRanking(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(parseInt(req.params.page));

		//expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});

	it('Case Average', async function () {
		req.params = {
			sort: 'average'
		};
		RankingDao.getPlayersAverageRanking = jasmine.createSpy().and.returnValue(playersRankingAverage);

		try {
			await getRanking(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledWith(parseInt(req.params.page));

		//expect(res.send).toHaveBeenCalledWith(playersRankingAverageResult);
	});

	it('Case default', async function () {
		req.params = {
			sort: 'anything'
		};
		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue(playersRankingSum);

		try {
			await getRanking(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(parseInt(req.params.page));

		//expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});

	// Bad requests are handled in routes
});

// Those tests are the same as above
/*describe('Function getRanking', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			page: '1'
		};

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue([]);
		RankingDao.getPlayersAverageRanking = jasmine.createSpy().and.returnValue([]);
	});

	it('Case Sum', async function () {
		req.params = {
			sort: 'classic'
		};
		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue(playersRankingSum);

		await getRanking(req);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(parseInt(req.params.page));

		expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});

	it('Case Average', async function () {
		req.params = {
			sort: 'average'
		};
		RankingDao.getPlayersAverageRanking = jasmine.createSpy().and.returnValue(playersRankingAverage);

		await getRanking(req);

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledWith(parseInt(req.params.page));

		expect(res.send).toHaveBeenCalledWith(playersRankingAverageResult);
	});

	it('Case default', async function () {
		req.params = {
			sort: 'anything'
		};
		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue(playersRankingSum);

		await getRanking(req);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(parseInt(req.params.page));

		expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});
});*/
