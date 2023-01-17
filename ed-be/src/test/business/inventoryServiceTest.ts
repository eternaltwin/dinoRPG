import { Request } from 'express';
import { Player } from '../../entity/index.js';
import { getAllItemsData, useItem } from '../../business/inventoryService.js';
import { PlayerData } from '../data/playerData.js';
import { playerFlyingShopInventory } from '../data/itemsData.js';
import { dinozId, itemId, mockRequest, player } from '../utils/constants.js';
import { cloneDeep } from 'lodash';
import { DinozDead, DinozLite } from '../data/dinozData.js';
import { addLife, getDinozFicheItemRequest } from '../../dao/dinozDao.js';
import { useItemDataRequest } from '../../dao/playerItemDao.js';

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');
const PlayerItemDAO = require('../../dao/playerItemDao.js');
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

describe('Function useItem', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			dinozId: dinozId.toString()
		};

		DinozDao.getDinozFicheItemRequest = jasmine.createSpy().and.returnValue(DinozLite);
		DinozDao.addLife = jasmine.createSpy();
		PlayerItemDAO.useItemDataRequest = jasmine.createSpy();
	});

	it("Dinoz doesn't belongs to player who do the request", async function () {
		req.params.itemId = String(2);
		const dinozNotPlayer = cloneDeep(DinozDead);
		dinozNotPlayer.player.id = player.id_2;
		DinozDao.getDinozFicheItemRequest = jasmine.createSpy().and.returnValue(dinozNotPlayer);

		try {
			await useItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${req.params.dinozId} doesn't belong to player.`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(0);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(0);
	});

	it('Item is not existant', async function () {
		req.params.itemId = String(31546);
		try {
			await useItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This item didn't exist`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(0);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(0);
	});

	it('Item category is not undefined', async function () {
		req.params.itemId = String(999);
		try {
			await useItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You don't have enough of item ${req.params.itemId}`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(0);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(0);
	});

	it('Player does not have enought item', async function () {
		req.params.itemId = String(3);
		const noMoreItem = cloneDeep(DinozLite);
		noMoreItem.player.items[0].quantity = 0;
		DinozDao.getDinozFicheItemRequest = jasmine.createSpy().and.returnValue(noMoreItem);

		try {
			await useItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You don't have enough of item ${req.params.itemId}`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(0);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(0);
	});

	it('Heal case', async function () {
		req.params.itemId = String(3);
		try {
			await useItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(1);
		expect(DinozDao.addLife).toHaveBeenCalledWith(
			dinozId,
			DinozLite.maxLife - DinozLite.life > 10 ? 10 : DinozLite.maxLife - DinozLite.life
		);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledWith(DinozLite.player.id, parseInt(req.params.itemId));
	});

	it('Heal case but dinoz is dead', async function () {
		req.params.itemId = String(3);
		const DinozLiteFullLife = cloneDeep(DinozLite);
		DinozLiteFullLife.life = 100;
		DinozDao.getDinozFicheItemRequest = jasmine.createSpy().and.returnValue(DinozLiteFullLife);

		try {
			await useItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`AlreadyAtMaxHealth`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(0);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(0);
	});

	it('Heal case but dinoz is dead', async function () {
		req.params.itemId = String(3);
		const DinozLiteDead = cloneDeep(DinozLite);
		DinozLiteDead.life = 0;
		DinozDao.getDinozFicheItemRequest = jasmine.createSpy().and.returnValue(DinozLiteDead);

		try {
			await useItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`DinozIsDead`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(0);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(0);
	});

	it('Resurrect case', async function () {
		req.params.itemId = String(2);
		const DinozLiteDead = cloneDeep(DinozLite);
		DinozLiteDead.life = 0;
		DinozDao.getDinozFicheItemRequest = jasmine.createSpy().and.returnValue(DinozLiteDead);
		try {
			await useItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(1);
		expect(DinozDao.addLife).toHaveBeenCalledWith(dinozId, 1);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledWith(DinozLite.player.id, parseInt(req.params.itemId));
	});

	it('Resurrect case but dinoz not dead', async function () {
		req.params.itemId = String(2);
		const DinozLiteNotDead = cloneDeep(DinozLite);
		DinozLiteNotDead.life = 10;
		DinozDao.getDinozFicheItemRequest = jasmine.createSpy().and.returnValue(DinozLiteNotDead);
		try {
			await useItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`DinozNotDead`);
		}

		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheItemRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(0);

		expect(PlayerItemDAO.useItemDataRequest).toHaveBeenCalledTimes(0);
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.

	// Bad requests are handled in routes
});
