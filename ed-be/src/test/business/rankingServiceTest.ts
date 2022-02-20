import { getRanking } from '../../business/rankingService.js';
import { mockRequest, mockResponse } from '../utils/constants.js';
import {
	playersRankingAverage,
	playersRankingAverageResult,
	playersRankingSum,
	playersRankingSumResult
} from '../data/rankingData.js';
import {
	ErrorFormatter,
	Result,
	ValidationError,
	validationResult
} from 'express-validator';
import { mocked } from 'ts-jest/utils';
import { Request, Response } from 'express';

jest.mock('express-validator');

const RankingDao = require('../../dao/rankingDao.js');

describe('Function getRanking', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			page: '1'
		};

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue([]);
		RankingDao.getPlayersAverageRanking = jasmine
			.createSpy()
			.and.returnValue([]);
	});

	it('Case Sum', async function () {
		req.params = {
			sort: 'classic'
		};
		RankingDao.getPlayersSumRanking = jasmine
			.createSpy()
			.and.returnValue(playersRankingSum);

		await getRanking(req, res);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(
			parseInt(req.params.page)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});

	it('Case Average', async function () {
		req.params = {
			sort: 'average'
		};
		RankingDao.getPlayersAverageRanking = jasmine
			.createSpy()
			.and.returnValue(playersRankingAverage);

		await getRanking(req, res);

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledWith(
			parseInt(req.params.page)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playersRankingAverageResult);
	});

	it('Case default', async function () {
		req.params = {
			sort: 'anything'
		};
		RankingDao.getPlayersSumRanking = jasmine
			.createSpy()
			.and.returnValue(playersRankingSum);

		await getRanking(req, res);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(
			parseInt(req.params.page)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});

	it('Bad request', async function () {
		const result = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getRanking(req, res);

		expect(RankingDao.getPlayersSumRanking).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function getRanking', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			page: '1'
		};

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		RankingDao.getPlayersSumRanking = jasmine.createSpy().and.returnValue([]);
		RankingDao.getPlayersAverageRanking = jasmine
			.createSpy()
			.and.returnValue([]);
	});

	it('Case Sum', async function () {
		req.params = {
			sort: 'classic'
		};
		RankingDao.getPlayersSumRanking = jasmine
			.createSpy()
			.and.returnValue(playersRankingSum);

		await getRanking(req, res);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(
			parseInt(req.params.page)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});

	it('Case Average', async function () {
		req.params = {
			sort: 'average'
		};
		RankingDao.getPlayersAverageRanking = jasmine
			.createSpy()
			.and.returnValue(playersRankingAverage);

		await getRanking(req, res);

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersAverageRanking).toHaveBeenCalledWith(
			parseInt(req.params.page)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playersRankingAverageResult);
	});

	it('Case default', async function () {
		req.params = {
			sort: 'anything'
		};
		RankingDao.getPlayersSumRanking = jasmine
			.createSpy()
			.and.returnValue(playersRankingSum);

		await getRanking(req, res);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledTimes(1);

		expect(RankingDao.getPlayersSumRanking).toHaveBeenCalledWith(
			parseInt(req.params.page)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playersRankingSumResult);
	});
});
