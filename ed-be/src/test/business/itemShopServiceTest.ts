import { Response } from 'express';
import { Request } from 'express';
import {
	ErrorFormatter,
	Result,
	ValidationError,
	validationResult
} from 'express-validator';
import { mocked } from 'ts-jest/utils';
// Back imports
import { getItemsFromShop, buyItem } from '../../business/itemShopService';
import { ItemFiche, ItemOwn, Player } from '../../models';
import { itemList, shopList } from '../../constants';
// Test imports
import { PlayerData } from '../data/playerData';
import { BasicItem, playerFlyingShopInventory } from '../data/ItemOwnData';
import { DinozAtForges } from '../data/dinozData';
import {
	player,
	mockRequest,
	mockResponse,
	shop,
	item
} from '../utils/constants.js';
import { cloneDeep } from 'lodash';

jest.mock('express-validator');

const PlayerDao = require('../../dao/playerDao.js');
const InventoryDao = require('../../dao/inventoryDao.js');
let PlayerTestData: Player;
let ItemTestData: ItemOwn;

/**
 * Test the nominal cases of getItemsFromShop()
 */
describe('itemShopService: Test nominal cases of getItemsFromShop()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		// Mock express-validator
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		// Repopulate PlayerTestData before each test to start with clean player data
		PlayerTestData = cloneDeep(PlayerData);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);
	});

	it('Nominal case: flying shop with no inventory', async function () {
		await getItemsFromShop(req, res);

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = [];
		shopList.FLYING_SHOP.listItemsSold.forEach(item => {
			expectedListItems.push({
				itemId: item.itemId,
				price: item.price,
				quantity: 0,
				maxQuantity: item.maxQuantity,
				canBeUsedNow: item.canBeUsedNow,
				canBeEquipped: item.canBeEquipped
			} as ItemFiche);
		});

		expect(res.status).toHaveBeenCalledWith(200);
		// Check all expected items from this shop have been received
		expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining(expectedListItems)
		);
	});

	it('Nominal case: flying shop with inventory', async function () {
		PlayerTestData.itemOwn = playerFlyingShopInventory;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await getItemsFromShop(req, res);

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);

		// Build the expected result, items owned by the player have a different quantity
		const expectedListItems: Array<ItemFiche> = [];
		shopList.FLYING_SHOP.listItemsSold.forEach(item => {
			const tempItem: ItemOwn | undefined = PlayerTestData.itemOwn.find(
				playerItem => playerItem.itemId === item.itemId
			);
			expectedListItems.push({
				itemId: item.itemId,
				price: item.price,
				quantity: tempItem ? tempItem.quantity : 0,
				maxQuantity: item.maxQuantity,
				canBeUsedNow: item.canBeUsedNow,
				canBeEquipped: item.canBeEquipped
			} as ItemFiche);
		});

		expect(res.status).toHaveBeenCalledWith(200);
		// Check all expected items with the relevant modified quantities have been received
		// If a quantity is wrong, this fails.
		expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining(expectedListItems)
		);
	});

	it('Nominal case: flying shop + shopkeeper', async function () {
		PlayerTestData.shopKeeper = true;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await getItemsFromShop(req, res);

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);

		// Build the expected result, 50 % more maxQuantity
		const expectedListItems: Array<ItemFiche> = [];
		shopList.FLYING_SHOP.listItemsSold.forEach(item => {
			expectedListItems.push({
				itemId: item.itemId,
				price: item.price,
				quantity: 0,
				maxQuantity: item.maxQuantity * 1.5,
				canBeUsedNow: item.canBeUsedNow,
				canBeEquipped: item.canBeEquipped
			} as ItemFiche);
		});

		expect(res.status).toHaveBeenCalledWith(200);
		// Check all expected items with the relevant modified maxQuantities have been received
		// If a maxQuantity is wrong, this fails
		expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining(expectedListItems)
		);
	});

	it('Nominal case: flying shop + merchant', async function () {
		PlayerTestData.merchant = true;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await getItemsFromShop(req, res);

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);

		// Build the expected result, price discounted by 10%
		const expectedListItems: Array<ItemFiche> = [];
		shopList.FLYING_SHOP.listItemsSold.forEach(item => {
			expectedListItems.push({
				itemId: item.itemId,
				price: item.price * 0.9,
				quantity: 0,
				maxQuantity: item.maxQuantity,
				canBeUsedNow: item.canBeUsedNow,
				canBeEquipped: item.canBeEquipped
			} as ItemFiche);
		});

		expect(res.status).toHaveBeenCalledWith(200);
		// Check all expected items with the relevant modified prices have been received
		// If a price is wrong, this fails
		expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining(expectedListItems)
		);
	});

	// TODO: test all shops as they are created (list of items properly retrieved)
	it('Nominal case: forges grand tout chaud shop', async function () {
		// Change shopId to the corresponding one
		req.params = {
			shopId: shopList.FORGE_SHOP.shopId.toString()
		};
		// Add a dinoz that is at the location of the shop
		PlayerTestData.dinoz.push(DinozAtForges);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await getItemsFromShop(req, res);

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = [];
		shopList.FORGE_SHOP.listItemsSold.forEach(item => {
			expectedListItems.push({
				itemId: item.itemId,
				price: item.price,
				quantity: 0,
				maxQuantity: item.maxQuantity,
				canBeUsedNow: item.canBeUsedNow,
				canBeEquipped: item.canBeEquipped
			} as ItemFiche);
		});
		expect(res.status).toHaveBeenCalledWith(200);
		// Check all expected items from this shop have been received
		expect(res.send).toHaveBeenCalledWith(
			expect.arrayContaining(expectedListItems)
		);
	});
});

/**
 * Test the error cases of getItemsFromShop()
 */
describe('itemShopService: Test error cases of getItemsFromShop()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		// Mock express-validator
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		// Repopulate PlayerTestData before each test to start with clean player data
		PlayerTestData = cloneDeep(PlayerData);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);
	});

	it('Error case: negative shopId', async function () {
		req.params = {
			shopId: shop.id_negative_1.toString()
		};

		await getItemsFromShop(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`The shop ${shop.id_negative_1} does not exist`
		);
	});

	it('Error case: letter shopId', async function () {
		req.params = {
			shopId: shop.id_letter_1.toString()
		};

		await getItemsFromShop(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`The shop NaN does not exist`);
	});

	it('Error case: non-existant shopId (i.e too big)', async function () {
		req.params = {
			shopId: shop.id_nonexistant_1.toString()
		};

		await getItemsFromShop(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`The shop ${shop.id_nonexistant_1} does not exist`
		);
	});

	it('Error case: no player found', async function () {
		req.user = {
			playerId: player.id_1
		};
		req.params = {
			shopId: shop.id_flying_1.toString()
		};

		PlayerDao.getPlayerShopItemsDataRequest = jasmine
			.createSpy()
			.and.returnValue(null);

		await getItemsFromShop(req, res);

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`Player ${player.id_1} doesn't exist`
		);
	});

	it('Error case: no dinoz at location of Forges Grand Tout Chaud', async function () {
		req.params = {
			shopId: shopList.FORGE_SHOP.shopId.toString()
		};

		await getItemsFromShop(req, res);

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(
			player.id_1
		);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`You cannot access the shop ${shopList.FORGE_SHOP.shopId}`
		);
	});

	it('Error case: bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getItemsFromShop(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

/**
 * Test the nominal cases of buyItem()
 */
describe('itemShopService: Test nominal cases of buyItem()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		// Mock express-validator
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		// Repopulate PlayerTestData before each test to start with clean player data
		PlayerTestData = cloneDeep(PlayerData);
		ItemTestData = cloneDeep(BasicItem);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: '1'
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();

		InventoryDao.createItemDataRequest = jasmine.createSpy();
		InventoryDao.updateItemDataRequest = jasmine.createSpy();

		ItemOwn.build = jasmine
			.createSpy()
			.and.returnValue({ get: jest.fn().mockReturnValue(BasicItem) });
		ItemOwn.create = jasmine
			.createSpy()
			.and.returnValue({ get: jest.fn().mockReturnValue(BasicItem) });
	});

	it('Nominal case: flying shop, player has none of the item', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 31;
		const expectedMoney: number =
			PlayerTestData.money - quantity * itemPurchased.price;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			player.id_1,
			expectedMoney
		);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Nominal case: flying shop, player has already some of the item', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 31;
		const expectedQuantity: number =
			quantity + playerFlyingShopInventory[0].quantity;
		const expectedMoney: number =
			PlayerTestData.money - quantity * itemPurchased.price;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add some item to the player test data
		PlayerTestData.itemOwn = playerFlyingShopInventory;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			player.id_1,
			expectedMoney
		);

		expect(InventoryDao.createItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.updateItemDataRequest).toHaveBeenCalledTimes(1);
		expect(InventoryDao.updateItemDataRequest).toHaveBeenCalledWith(
			PlayerTestData.playerId,
			itemPurchased.itemId,
			expectedQuantity
		);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Nominal case: flying shop, player has no item and merchant', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 31;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add some item to the player test data, just enough money to buy because he has merchant
		PlayerTestData.merchant = true;
		PlayerTestData.money = quantity * itemPurchased.price * 0.9 + 1;
		const expectedMoney: number =
			PlayerTestData.money - quantity * itemPurchased.price * 0.9;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			player.id_1,
			expectedMoney
		);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Nominal case: flying shop, player has no item and shopkeeper', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = itemList.POTION_IRMA.maxQuantity + 1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add some item to the player test data
		PlayerTestData.shopKeeper = true;
		PlayerTestData.money = 500000;
		const expectedMoney: number =
			PlayerTestData.money - quantity * itemPurchased.price;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			player.id_1,
			expectedMoney
		);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Nominal case: forges grand tout chaud', async function () {
		const itemPurchased = shopList.FORGE_SHOP.listItemsSold.find(
			item => item.itemId === itemList.GLOBIN_MERGUEZ.itemId
		) as ItemFiche;
		const quantity: number = 2;
		const expectedMoney: number =
			PlayerTestData.money - quantity * itemPurchased.price;

		// Change parameters
		req.params = {
			shopId: shopList.FORGE_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.GLOBIN_MERGUEZ.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is at the location of the shop
		PlayerTestData.dinoz.push(DinozAtForges);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			player.id_1,
			expectedMoney
		);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);

		expect(res.status).toHaveBeenCalledWith(200);
	});
});

/**
 * Test the error cases of buyItem()
 */
describe('itemShopService: Test error cases of buyItem()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		// Mock express-validator
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		// Repopulate PlayerTestData before each test to start with clean player data
		PlayerTestData = cloneDeep(PlayerData);
		ItemTestData = cloneDeep(BasicItem);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: '1'
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();

		InventoryDao.createItemDataRequest = jasmine.createSpy();
		InventoryDao.updateItemDataRequest = jasmine.createSpy();

		ItemOwn.build = jasmine
			.createSpy()
			.and.returnValue({ get: jest.fn().mockResolvedValue(BasicItem) });
		ItemOwn.create = jasmine
			.createSpy()
			.and.returnValue({ get: jest.fn().mockResolvedValue(BasicItem) });
	});

	it('Error case: invalid quantity, 0 quantity', async function () {
		const quantity: number = 0;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`Invalid quantity of items ${quantity}`
		);
	});

	it('Error case: invalid quantity, negative number', async function () {
		const quantity: number = -1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`Invalid quantity of items ${quantity}`
		);
	});

	it('Error case: negative shopId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shop.id_negative_1.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`The shop ${shop.id_negative_1} does not exist`
		);
	});

	it('Error case: non-existant shopId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shop.id_nonexistant_1.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`The shop ${shop.id_nonexistant_1} does not exist`
		);
	});

	it('Error case: letter shopId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shop.id_letter_1
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
	});

	it('Error case: negative itemId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: item.id_negative_1.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`The item ${item.id_negative_1} does not exist in the shop ${shopList.FLYING_SHOP.shopId}`
		);
	});

	it('Error case: letter itemId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: item.id_letter_1.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`The item NaN does not exist in the shop ${shopList.FLYING_SHOP.shopId}`
		);
	});

	it('Error case: non-existant itemId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: item.id_nonexistant_1.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`The item ${item.id_nonexistant_1} does not exist in the shop ${shopList.FLYING_SHOP.shopId}`
		);
	});

	it('Error case: no player found', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(null);

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`Player ${player.id_1} doesn't exist`
		);
	});

	it('Error case: not enough money', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is at the location of the shop
		PlayerTestData.money = 0;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`You don't have enough money to buy ${quantity} of the item ${itemPurchased.itemId}`
		);
	});

	it('Error case: not enough storage available', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = itemList.POTION_IRMA.maxQuantity + 1;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is at the location of the shop
		PlayerTestData.money = 5000000;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine
			.createSpy()
			.and.returnValue(PlayerTestData);

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`You don't have enough storage to buy ${quantity} of the item ${itemPurchased.itemId}`
		);
	});

	it('Error case: no dinoz at location of Forges Grand Tout Chaud', async function () {
		const itemPurchased = shopList.FORGE_SHOP.listItemsSold.find(
			item => item.itemId === itemList.GLOBIN_MERGUEZ.itemId
		) as ItemFiche;
		const quantity: number = 2;

		// Change parameters
		req.params = {
			shopId: shopList.FORGE_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.GLOBIN_MERGUEZ.itemId.toString(),
			quantity: quantity.toString()
		};

		await buyItem(req, res);

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(
			player.id_1,
			itemPurchased.itemId
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`You cannot access the shop ${shopList.FORGE_SHOP.shopId}`
		);
	});

	it('Error case: bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await buyItem(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});
});
