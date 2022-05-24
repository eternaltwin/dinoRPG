import { Response } from 'express';
import { Request } from 'express';
import { ErrorFormatter, Result, ValidationError, validationResult } from 'express-validator';
import { mocked } from 'ts-jest/utils';
import { Player } from '../../models';
import { getAllItemsData } from '../../business/inventoryService';
import { PlayerData } from '../data/playerData';
import { playerFlyingShopInventory } from '../data/ItemOwnData';
import { mockRequest, mockResponse, player } from '../utils/constants';
import { cloneDeep } from 'lodash';

jest.mock('express-validator');

const PlayerDao = require('../../dao/playerDao.js');
let PlayerTestData: Player;

/**
 * Test all cases of getPlayerInventoryDataRequest()
 */
describe('inventoryService: All test cases of getPlayerInventoryDataRequest()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		// Mock express-validator
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		PlayerTestData = cloneDeep(PlayerData);
		PlayerTestData.itemOwn = playerFlyingShopInventory;

		PlayerDao.getPlayerInventoryDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
	});

	it('Nominal case', async function () {
		await getAllItemsData(req, res);

		expect(PlayerDao.getPlayerInventoryDataRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerInventoryDataRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ itemId: 1, quantity: 12 }),
				expect.objectContaining({ itemId: 2, quantity: 8 })
			])
		);
	});

	it('Error case: no player', async function () {
		PlayerDao.getPlayerInventoryDataRequest = jasmine.createSpy().and.returnValue(null);

		await getAllItemsData(req, res);

		expect(PlayerDao.getPlayerInventoryDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerInventoryDataRequest).toHaveBeenCalledWith(player.id_1);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Player ${player.id_1} doesn't exist`);
	});

	it('Error case: bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getAllItemsData(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});
});
