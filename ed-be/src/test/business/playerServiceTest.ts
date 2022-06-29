import {
	BasicImportedPlayer,
	BasicNotImportedPlayer,
	PlayerData,
	playerList,
	PlayerWithDinoz,
	PlayerWithRewards
} from '../data/playerData.js';
import { mockRequest, mockResponse, player } from '../utils/constants.js';
import {
	getAccountData,
	getCommonData,
	importAccount,
	searchPlayers,
	setCustomText
} from '../../business/playerService.js';
import { Request, Response } from 'express';
import { ErrorFormatter, Result, ValidationError, validationResult } from 'express-validator';
import { mocked } from 'ts-jest/utils';

jest.mock('express-validator');

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');
const assPlayerRewardsDao = require('../../dao/assPlayerRewardsDao.js');

describe('Function getCommonData()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		PlayerDao.getCommonDataRequest = jasmine.createSpy().and.returnValue(PlayerWithDinoz);
		DinozDao.getDinozTotalCount = jasmine.createSpy().and.returnValue(2);

		PlayerWithDinoz.setDataValue = jasmine.createSpy().and.returnValue([]);
	});

	it('Nominal case', async function () {
		await getCommonData(req, res);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozTotalCount).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledWith(req.user!.playerId);

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

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		PlayerDao.getPlayerDataRequest = jasmine.createSpy().and.returnValue(PlayerData);
	});

	it('Nominal case', async function () {
		await getAccountData(req, res);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ dinozCount: 1 }));
	});

	it("Player doesn't exists", async function () {
		PlayerDao.getPlayerDataRequest = jasmine.createSpy().and.returnValue(null);

		await getAccountData(req, res);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Player ${player.id_1} doesn't exists`);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getAccountData(req, res);

		expect(PlayerDao.getPlayerDataRequest).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function importAccount', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		req.user = {
			playerId: player.id_1
		};
		req.body = {
			server: 'fr'
		};

		PlayerDao.getImportedData = jasmine.createSpy().and.returnValue(BasicNotImportedPlayer);
		PlayerDao.resetUser = jasmine.createSpy().and.returnValue(true);
		assPlayerRewardsDao.addRewardToPlayer = jasmine.createSpy().and.returnValue(true);
		PlayerDao.setHasImported = jasmine.createSpy().and.returnValue(true);
	});

	it('Nominal case', async function () {
		await importAccount(req, res);

		expect(PlayerDao.getImportedData).toHaveBeenCalledTimes(1);
		expect(PlayerDao.resetUser).toHaveBeenCalledTimes(1);
		expect(assPlayerRewardsDao.addRewardToPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setHasImported).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getImportedData).toHaveBeenCalledWith(player.id_1);
		expect(PlayerDao.resetUser).toHaveBeenCalledWith(player.id_1);
		expect(assPlayerRewardsDao.addRewardToPlayer).toHaveBeenCalledWith(player.id_1, 100);
		expect(PlayerDao.setHasImported).toHaveBeenCalledWith(player.id_1, true);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("Player doesn't exists", async function () {
		PlayerDao.getImportedData = jasmine.createSpy().and.returnValue(null);

		await importAccount(req, res);

		expect(PlayerDao.getImportedData).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getImportedData).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Player ${player.id_1} doesn't exists`);
	});

	it('Player has already imported his account', async function () {
		PlayerDao.getImportedData = jasmine.createSpy().and.returnValue(BasicImportedPlayer);

		await importAccount(req, res);

		expect(PlayerDao.getImportedData).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getImportedData).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Player ${player.id_1} has already imported his account`);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await importAccount(req, res);

		expect(PlayerDao.getImportedData).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function setCustomText', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			id: player.id_1.toString()
		};
		req.body = {
			message: 'bonjour'
		};

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(PlayerData);
		PlayerDao.editCustomText = jasmine.createSpy().and.returnValue(true);
	});

	it('Nominal case', async function () {
		await setCustomText(req, res);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.editCustomText).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);
		expect(PlayerDao.editCustomText).toHaveBeenCalledWith(player.id_1, req.body.message);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("Player doesn't exists", async function () {
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(null);

		await setCustomText(req, res);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Player ${player.id_1} doesn't exists`);
	});

	it('Player cannot edit', async function () {
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(PlayerWithRewards);

		await setCustomText(req, res);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Player ${player.id_1} cannot edit this field`);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await setCustomText(req, res);

		expect(PlayerDao.getPlayerRewardsRequest).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function searchPlayers', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			name: 'Bio'
		};

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		PlayerDao.searchPlayersByName = jasmine.createSpy().and.returnValue(playerList);
	});

	it('Nominal case', async function () {
		await searchPlayers(req, res);

		expect(PlayerDao.searchPlayersByName).toHaveBeenCalledTimes(1);

		expect(PlayerDao.searchPlayersByName).toHaveBeenCalledWith(req.params.name);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playerList);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await searchPlayers(req, res);

		expect(PlayerDao.searchPlayersByName).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});
