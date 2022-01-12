import { BasicPlayer, PlayerData } from '../data/playerData.js';
import { mockRequest, mockResponse, player } from '../utils/constants.js';
import { getAccountData, getCommonData } from '../../business/playerService.js';
import { Request, Response } from 'express';
import {
	ErrorFormatter,
	Result,
	ValidationError,
	validationResult
} from 'express-validator';
import { mocked } from 'ts-jest/utils';

jest.mock('express-validator');

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');

describe('Function getCommonData()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		PlayerDao.getCommonDataRequest = jasmine
			.createSpy()
			.and.returnValue(BasicPlayer);
		DinozDao.getDinozTotalCount = jasmine.createSpy().and.returnValue(2);

		BasicPlayer.setDataValue = jasmine.createSpy().and.returnValue([]);
	});

	it('Nominal case', async function () {
		await getCommonData(req, res);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozTotalCount).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledWith(
			req.user!.playerId
		);

		expect(res.status).toHaveBeenCalledWith(200);
	});
});

describe('Function getAccountData', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			id: player.id_1.toString()
		};

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		PlayerDao.getPlayerDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerData);
	});

	it('Nominal case', async function () {
		await getAccountData(req, res);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({ dinozCount: 1 })
		);
	});

	it("Player doesn't exists", async function () {
		PlayerDao.getPlayerDataRequest = jasmine.createSpy().and.returnValue(null);

		await getAccountData(req, res);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`Player ${player.id_1} doesn't exists`
		);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getAccountData(req, res);

		expect(PlayerDao.getPlayerDataRequest).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});
