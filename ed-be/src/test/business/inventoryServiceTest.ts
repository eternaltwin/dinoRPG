import { Response } from 'express';
import { Request } from 'express';
import {
	ErrorFormatter,
	Result,
	ValidationError,
	validationResult
} from 'express-validator';
import { mocked } from 'ts-jest/utils';
import { getAllItemsData } from '../../business/inventoryService';
import { playerInventory } from '../data/ItemOwnData';
import { mockRequest, mockResponse, player } from '../utils/constants';

const InventoryDao = require('../../dao/inventoryDao.js');

describe('Function getAllItemsData()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		InventoryDao.getAllItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(playerInventory);
	});

	it('Nominal case', async function () {
		await getAllItemsData(req, res);

		expect(InventoryDao.getAllItemsDataRequest).toHaveBeenCalledTimes(1);

		expect(InventoryDao.getAllItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ itemId: 1, name: 'potion_irma' }),
				expect.objectContaining({ itemId: 2, name: 'potion_angel' })
			])
		);
	});
});
