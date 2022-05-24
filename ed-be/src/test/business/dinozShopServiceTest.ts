import { Dinoz } from '../../models/index.js';
import { DinozFromShop, DinozShopArray } from '../data/dinozShopData.js';
import { PlayerWithRewards } from '../data/playerData.js';
import { mockRequest, mockResponse, player } from '../utils/constants.js';
import { getDinozFromDinozShop } from '../../business/dinozShopService.js';
import { Request } from 'express';
import { Response } from 'express';
import { ErrorFormatter, Result, ValidationError, validationResult } from 'express-validator';
import { mocked } from 'ts-jest/utils';
import { DinozWithSkills } from '../data/dinozData.js';

jest.mock('express-validator');

const DinozShopDao = require('../../dao/shopDao');
const PlayerDao = require('../../dao/playerDao');
const Config = require('../../utils/context');

describe('Function getDinozFromDinozShop()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		DinozShopDao.createMultipleDinoz = jasmine.createSpy().and.returnValue(DinozShopArray);
		DinozShopDao.getDinozFromDinozShopRequest = jasmine.createSpy().and.returnValue([]);
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(PlayerWithRewards);
		Config.getConfig = jasmine.createSpy().and.returnValue({
			shop: { dinozInShop: 4, buyableQuetzu: 6 }
		});

		DinozFromShop.setDataValue = jasmine.createSpy().and.returnValue([]);
		Dinoz.build = jasmine.createSpy().and.returnValue({ get: jest.fn().mockResolvedValue(DinozWithSkills) });
	});

	it('No dinoz found, shop must be initialized', async function () {
		await getDinozFromDinozShop(req, res);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.createMultipleDinoz).toHaveBeenCalledTimes(1);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(player.id_1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);
		expect(DinozShopDao.createMultipleDinoz).toHaveBeenCalledWith(expect.any(Array));

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Dinoz already exist in shop', async function () {
		DinozShopDao.getDinozFromDinozShopRequest = jasmine.createSpy().and.returnValue(DinozShopArray);

		await getDinozFromDinozShop(req, res);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerRewardsRequest).not.toHaveBeenCalled();

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Player found is null', async function () {
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(null);

		await getDinozFromDinozShop(req, res);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(player.id_1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith('Player not found');
	});
});
