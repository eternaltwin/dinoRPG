import { Request } from 'express';
import { Player } from '../../entity/index.js';
import { getAllItemsData } from '../../business/inventoryService.js';
import { PlayerData } from '../data/playerData.js';
import { playerFlyingShopInventory } from '../data/itemsData.js';
import { mockRequest, player } from '../utils/constants.js';
import { cloneDeep } from 'lodash';

const PlayerDao = require('../../dao/playerDao.js');
let PlayerTestData: Player;

/**
 * Test all cases of getPlayerInventoryDataRequest()
 */
describe('inventoryService: All test cases of getPlayerInventoryDataRequest()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		PlayerTestData = cloneDeep(PlayerData);
		PlayerTestData.items = playerFlyingShopInventory;

		PlayerDao.getPlayerInventoryDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
	});

	it('Nominal case', async function () {
		try {
			await getAllItemsData(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerInventoryDataRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerInventoryDataRequest).toHaveBeenCalledWith(player.id_1);

		/*expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ itemId: 1, quantity: 12 }),
				expect.objectContaining({ itemId: 2, quantity: 8 })
			])
		);*/
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.

	// Bad requests are handled in routes
});
