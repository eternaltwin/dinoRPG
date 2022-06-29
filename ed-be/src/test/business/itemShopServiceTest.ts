import { Request } from 'express';
// Back imports
import { getItemsFromShop, buyItem } from '../../business/itemShopService';
import { AssDinozStatus, ItemFiche, ItemOwn, Player, Dinoz, ShopType } from '../../models';
import { itemList, placeList, shopList, statusList } from '../../constants';
// Test imports
import { PlayerData } from '../data/playerData';
import { DinozData } from '../data/dinozData';
import { BasicItem, playerFlyingShopInventory, playerMagicShopInventory } from '../data/ItemOwnData';
import { player, mockRequest, shop, item } from '../utils/constants.js';
import { cloneDeep } from 'lodash';
import { getRandomNumber } from '../../utils/tools.js';

const PlayerDao = require('../../dao/playerDao.js');
const InventoryDao = require('../../dao/inventoryDao.js');
let PlayerTestData: Player;
let DinozTestData: Dinoz;

/**
 * Test the nominal cases of getItemsFromShop()
 */
describe('itemShopService: Test nominal cases of getItemsFromShop()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		// Repopulate PlayerTestData and DinozData before each test to start with clean data
		PlayerTestData = cloneDeep(PlayerData);
		DinozTestData = cloneDeep(DinozData);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
	});

	it('Nominal case: flying shop with no inventory', async function () {
		let response: Array<ItemFiche> = [];
		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			response = await getItemsFromShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = shopList.FLYING_SHOP.listItemsSold.map(itemShop => {
			// Get the reference of the items from the constants
			const itemReference: ItemFiche | undefined = Object.values(itemList).find(
				item => item.itemId === itemShop.itemId
			)!;
			return {
				itemId: itemReference.itemId!,
				price: itemShop.price!,
				quantity: 0,
				maxQuantity: itemReference.maxQuantity,
				canBeUsedNow: itemReference.canBeUsedNow,
				canBeEquipped: itemReference.canBeEquipped,
				itemType: itemReference.itemType,
				isRare: itemReference.isRare
			};
		});

		// Check all expected items from this shop have been received
		expect(response).toStrictEqual(expectedListItems);
	});

	it('Nominal case: flying shop with inventory', async function () {
		PlayerTestData.itemOwn = playerFlyingShopInventory;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		let response: Array<ItemFiche> = [];
		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			response = await getItemsFromShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = shopList.FLYING_SHOP.listItemsSold.map(itemShop => {
			// Get the item from the player
			const itemPlayer: ItemOwn | undefined = PlayerTestData.itemOwn.find(
				playerItem => playerItem.itemId === itemShop.itemId
			);
			// Get the reference of the items from the constants
			const itemReference: ItemFiche | undefined = Object.values(itemList).find(
				item => item.itemId === itemShop.itemId
			)!;
			return {
				itemId: itemReference.itemId!,
				price: itemShop.price!,
				quantity: itemPlayer ? itemPlayer.quantity : 0,
				maxQuantity: itemReference.maxQuantity,
				canBeUsedNow: itemReference.canBeUsedNow,
				canBeEquipped: itemReference.canBeEquipped,
				itemType: itemReference.itemType,
				isRare: itemReference.isRare
			};
		});

		// Check all expected items from this shop have been received
		expect(response).toStrictEqual(expectedListItems);
	});

	it('Nominal case: flying shop + shopkeeper', async function () {
		PlayerTestData.shopKeeper = true;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		let response: Array<ItemFiche> = [];
		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			response = await getItemsFromShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = shopList.FLYING_SHOP.listItemsSold.map(itemShop => {
			// Get the reference of the items from the constants
			const itemReference: ItemFiche | undefined = Object.values(itemList).find(
				item => item.itemId === itemShop.itemId
			)!;
			return {
				itemId: itemReference.itemId!,
				price: itemShop.price!,
				quantity: 0,
				maxQuantity: itemReference.maxQuantity * 1.5,
				canBeUsedNow: itemReference.canBeUsedNow,
				canBeEquipped: itemReference.canBeEquipped,
				itemType: itemReference.itemType,
				isRare: itemReference.isRare
			};
		});

		// Check all expected items from this shop have been received
		expect(response).toStrictEqual(expectedListItems);
	});

	it('Nominal case: magic shop + shopkeeper, no increased capacity', async function () {
		// Change shopId to the corresponding one
		req.params.shopId = shopList.MAGIC_SHOP.shopId.toString();

		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = placeList.DINOVILLE.placeId;
		PlayerTestData.dinoz.push(DinozTestData);
		PlayerTestData.shopKeeper = true;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		let response: Array<ItemFiche> = [];
		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			response = await getItemsFromShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = shopList.MAGIC_SHOP.listItemsSold.map(itemShop => {
			// Get the reference of the items from the constants
			const itemReference: ItemFiche | undefined = Object.values(itemList).find(
				item => item.itemId === itemShop.itemId
			)!;
			return {
				itemId: itemReference.itemId!,
				price: itemShop.price!,
				quantity: 0,
				maxQuantity: itemReference.maxQuantity,
				canBeUsedNow: itemReference.canBeUsedNow,
				canBeEquipped: itemReference.canBeEquipped,
				itemType: itemReference.itemType,
				isRare: itemReference.isRare
			};
		});

		// Check all expected items from this shop have been received
		expect(response).toStrictEqual(expectedListItems);
	});

	it('Nominal case: flying shop + merchant, discounted prices', async function () {
		PlayerTestData.merchant = true;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		let response: Array<ItemFiche> = [];
		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			response = await getItemsFromShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = shopList.FLYING_SHOP.listItemsSold.map(itemShop => {
			// Get the reference of the items from the constants
			const itemReference: ItemFiche | undefined = Object.values(itemList).find(
				item => item.itemId === itemShop.itemId
			)!;
			return {
				itemId: itemReference.itemId,
				price: itemShop.price! * 0.9,
				quantity: 0,
				maxQuantity: itemReference.maxQuantity,
				canBeUsedNow: itemReference.canBeUsedNow,
				canBeEquipped: itemReference.canBeEquipped,
				itemType: itemReference.itemType,
				isRare: itemReference.isRare
			};
		});

		// Check all expected items from this shop have been received
		expect(response).toStrictEqual(expectedListItems);
	});

	it('Nominal case: non-flying shop + merchant, no price change', async function () {
		// Change shopId to the corresponding one
		req.params.shopId = shopList.FORGE_SHOP.shopId.toString();

		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = placeList.FORGES_DU_GTC.placeId;
		PlayerTestData.dinoz.push(DinozTestData);
		PlayerTestData.merchant = true;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		let response: Array<ItemFiche> = [];
		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			response = await getItemsFromShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = shopList.FORGE_SHOP.listItemsSold.map(itemShop => {
			// Get the reference of the items from the constants
			const itemReference: ItemFiche | undefined = Object.values(itemList).find(
				item => item.itemId === itemShop.itemId
			)!;
			return {
				itemId: itemReference.itemId!,
				price: itemShop.price!,
				quantity: 0,
				maxQuantity: itemReference.maxQuantity,
				canBeUsedNow: itemReference.canBeUsedNow,
				canBeEquipped: itemReference.canBeEquipped,
				itemType: itemReference.itemType,
				isRare: itemReference.isRare
			};
		});

		// Check all expected items from this shop have been received
		expect(response).toStrictEqual(expectedListItems);
	});

	it.each(Object.values(shopList))('Nominal case - test all shops: getAllItems from Shop %#', async shopToTest => {
		// Change shopId to the corresponding one
		req.params.shopId = shopToTest.shopId.toString();

		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = shopToTest.placeId;
		// In case of testing the cursed shop, the dinoz also needs to be cursed
		if (shopToTest.type === ShopType.CURSED) {
			DinozTestData.status.push({
				statusId: statusList.CURSED
			} as AssDinozStatus);
		}
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		let response: Array<ItemFiche> = [];
		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			response = await getItemsFromShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);

		// Build the expected result
		const expectedListItems: Array<ItemFiche> = shopToTest.listItemsSold.map(itemShop => {
			// Get the reference of the items from the constants
			const itemReference: ItemFiche | undefined = Object.values(itemList).find(
				item => item.itemId === itemShop.itemId
			)!;
			return {
				itemId: itemReference.itemId!,
				price: itemShop.price!,
				quantity: 0,
				maxQuantity: itemReference.maxQuantity,
				canBeUsedNow: itemReference.canBeUsedNow,
				canBeEquipped: itemReference.canBeEquipped,
				itemType: itemReference.itemType,
				isRare: itemReference.isRare
			};
		});

		// Check all expected items from this shop have been received
		expect(response).toStrictEqual(expectedListItems);
	});
});

/**
 * Test the error cases of getItemsFromShop()
 */
describe('itemShopService: Test error cases of getItemsFromShop()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		// Repopulate PlayerTestData before each test to start with clean player data
		PlayerTestData = cloneDeep(PlayerData);
		DinozTestData = cloneDeep(DinozData);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
	});

	it('Error case: negative shopId', async function () {
		req.params = {
			shopId: shop.id_negative_1.toString()
		};

		try {
			await getItemsFromShop(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The shop ${shop.id_negative_1.toString()} does not exist`);
		}
	});

	it('Error case: letter shopId', async function () {
		req.params = {
			shopId: shop.id_letter_1.toString()
		};

		try {
			await getItemsFromShop(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The shop NaN does not exist`);
		}
	});

	it('Error case: non-existant shopId (i.e too big)', async function () {
		req.params = {
			shopId: shop.id_nonexistant_1.toString()
		};

		try {
			await getItemsFromShop(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The shop ${shop.id_nonexistant_1} does not exist`);
		}
	});

	it('Error case: no player found', async function () {
		req.user = {
			playerId: player.id_1
		};
		req.params = {
			shopId: shop.id_flying_1.toString()
		};

		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(null);

		try {
			await getItemsFromShop(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Player ${player.id_1} doesn't exist`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);
	});

	it.each(Object.values(shopList))('Error case - test all shops: getAllItems from Shop %#', async shopToTest => {
		req.params = {
			shopId: shopToTest.shopId.toString()
		};

		try {
			await getItemsFromShop(req);
			// Skip test for flying shop
			if (shopToTest.shopId !== shopList.FLYING_SHOP.shopId) {
				fail();
			}
		} catch (err) {
			const e: Error = err as Error;
			// Expected message is different for the cursed shop
			if (shopToTest.type === ShopType.CURSED) {
				expect(e.message).toBe(`You need a cursed dinoz at the location of the shop to access it`);
			} else {
				expect(e.message).toBe(`You don't have any dinoz at the shop's location ${shopToTest.shopId}`);
			}
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);
	});

	// Corner case of the cursed shop
	it('Error case: dinoz at Ashpouk Ruins is not cursed and cannot access Cursed Shop', async function () {
		req.params = {
			shopId: shopList.CURSED_SHOP.shopId.toString()
		};

		// Add a dinoz that is at the location of the shop and cursed
		DinozTestData.placeId = placeList.RUINES_ASHPOUK.placeId;
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await getItemsFromShop(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need a cursed dinoz at the location of the shop to access it`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);
	});

	// Corner case of the cursed shop
	it('Error case: cursed dinoz but not at Ashpouk Ruins and cannot access Cursed Shop', async function () {
		req.params = {
			shopId: shopList.CURSED_SHOP.shopId.toString()
		};

		// Add a dinoz that is at the location of the shop and cursed
		DinozTestData.placeId = placeList.DINOVILLE.placeId;
		DinozTestData.status.push({
			statusId: statusList.CURSED
		} as AssDinozStatus);
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await getItemsFromShop(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need a cursed dinoz at the location of the shop to access it`);
		}

		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopItemsDataRequest).toHaveBeenCalledWith(player.id_1);
	});
});

/**
 * Test the nominal cases of buyItem()
 */
describe('itemShopService: Test nominal cases of buyItem()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		// Repopulate PlayerTestData before each test to start with clean player data
		PlayerTestData = cloneDeep(PlayerData);
		DinozTestData = cloneDeep(DinozData);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: '1'
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();

		InventoryDao.createItemDataRequest = jasmine.createSpy();
		InventoryDao.updateItemDataRequest = jasmine.createSpy();

		ItemOwn.build = jasmine.createSpy().and.returnValue({ get: jest.fn().mockReturnValue(BasicItem) });
		ItemOwn.create = jasmine.createSpy().and.returnValue({ get: jest.fn().mockReturnValue(BasicItem) });
	});

	it('Nominal case: flying shop, player has none of the item', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 31;
		const expectedMoney: number = PlayerTestData.money - quantity * itemPurchased.price;

		// Change parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);
	});

	it('Nominal case: flying shop, player has already some of the item', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 31;
		const expectedQuantity: number = quantity + playerFlyingShopInventory[0].quantity;
		const expectedMoney: number = PlayerTestData.money - quantity * itemPurchased.price;

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
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);

		expect(InventoryDao.createItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.updateItemDataRequest).toHaveBeenCalledTimes(1);
		expect(InventoryDao.updateItemDataRequest).toHaveBeenCalledWith(
			PlayerTestData.playerId,
			itemPurchased.itemId,
			expectedQuantity
		);
	});

	it('Nominal case: magic shop, player has already some of the item', async function () {
		const itemPurchased = shopList.MAGIC_SHOP.listItemsSold.find(
			item => item.itemId === itemList.TEAR_OF_LIFE.itemId
		) as ItemFiche;
		const quantity: number = 1;
		const expectedQuantity: number = quantity + playerMagicShopInventory[0].quantity;
		const expectedNapo: number = 999 - quantity * itemPurchased.price;

		// Change parameters
		req.params = {
			shopId: shopList.MAGIC_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.TEAR_OF_LIFE.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add some item to the player test data
		PlayerTestData.itemOwn = playerMagicShopInventory;
		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = placeList.DINOVILLE.placeId;
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.setPlayerMoneyRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.updateItemDataRequest).toHaveBeenCalledTimes(2);
		expect(InventoryDao.updateItemDataRequest).toHaveBeenNthCalledWith(
			1,
			player.id_1,
			itemList.GOLDEN_NAPODINO.itemId,
			expectedNapo
		);
		expect(InventoryDao.updateItemDataRequest).toHaveBeenNthCalledWith(
			2,
			PlayerTestData.playerId,
			itemPurchased.itemId,
			expectedQuantity
		);
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

		// Add some money to the player test data, just enough money to buy because he has merchant
		PlayerTestData.merchant = true;
		PlayerTestData.money = quantity * itemPurchased.price * 0.9 + 1;
		const expectedMoney: number = PlayerTestData.money - quantity * itemPurchased.price * 0.9;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);
	});

	it('Nominal case: non-flying shop, player has no item and merchant', async function () {
		const itemPurchased = shopList.FORGE_SHOP.listItemsSold.find(
			item => item.itemId === itemList.REFRIGERATED_SHIELD.itemId
		) as ItemFiche;
		const quantity: number = 8;

		// Change parameters
		req.params = {
			shopId: shopList.FORGE_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.REFRIGERATED_SHIELD.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = shopList.FORGE_SHOP.placeId;
		PlayerTestData.dinoz.push(DinozTestData);
		// Add some money to the player test data, just enough money to buy
		PlayerTestData.merchant = true;
		PlayerTestData.money = quantity * itemPurchased.price + 1;
		const expectedMoney: number = PlayerTestData.money - quantity * itemPurchased.price;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);
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
		const expectedMoney: number = PlayerTestData.money - quantity * itemPurchased.price;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);

		expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);
	});

	it.each(Object.values(shopList))('Nominal case - test all shops: buyItem from Shop %#', async shopToTest => {
		// Update test data first
		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = shopToTest.placeId;
		// In case of testing the cursed shop, the dinoz also needs to be cursed
		if (shopToTest.type === ShopType.CURSED) {
			DinozTestData.status.push({
				statusId: statusList.CURSED
			} as AssDinozStatus);
		}
		// In case of the magicShop, the player needs golden napodinoz
		if (shopToTest.type === ShopType.MAGICAL) {
			PlayerTestData.itemOwn = [
				{
					itemId: itemList.GOLDEN_NAPODINO.itemId,
					quantity: 999
				}
			] as Array<ItemOwn>;
		}
		PlayerTestData.dinoz.push(DinozTestData);
		PlayerTestData.money = 500000;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		const quantity: number = 1;
		// Get a random item from the shop list
		const randomNumber: number = getRandomNumber(0, shopToTest.listItemsSold.length - 1);
		const randomItemPurchased: Partial<ItemFiche> = shopToTest.listItemsSold[randomNumber];
		const expectedMoney: number = PlayerTestData.money - quantity * randomItemPurchased.price!;
		const expectedNapo: number = 999 - quantity * randomItemPurchased.price!;

		// Update parameters
		req.params = {
			shopId: shopToTest.shopId.toString()
		};
		req.body = {
			itemId: randomItemPurchased.itemId!,
			quantity: quantity.toString()
		};

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occured during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, randomItemPurchased.itemId);

		// For a magical shop we expect the number of golden napodinoz to change instead of the money
		if (shopToTest.type === ShopType.MAGICAL) {
			expect(PlayerDao.setPlayerMoneyRequest).not.toHaveBeenCalled();
			expect(InventoryDao.updateItemDataRequest).toHaveBeenCalledTimes(1);
			expect(InventoryDao.updateItemDataRequest).toHaveBeenCalledWith(
				player.id_1,
				itemList.GOLDEN_NAPODINO.itemId,
				expectedNapo
			);
		} else {
			expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
			expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);
			expect(InventoryDao.updateItemDataRequest).not.toHaveBeenCalled();
		}

		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledTimes(1);
		// I don't understand this check
		expect(InventoryDao.createItemDataRequest).toHaveBeenCalledWith(BasicItem);
	});
});

/**
 * Test the error cases of buyItem()
 */
describe('itemShopService: Test error cases of buyItem()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		// Repopulate PlayerTestData before each test to start with clean player data
		PlayerTestData = cloneDeep(PlayerData);
		DinozTestData = cloneDeep(DinozData);

		// Default query test parameters
		req.params = {
			shopId: shopList.FLYING_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: '1'
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();

		InventoryDao.createItemDataRequest = jasmine.createSpy();
		InventoryDao.updateItemDataRequest = jasmine.createSpy();

		ItemOwn.build = jasmine.createSpy().and.returnValue({ get: jest.fn().mockResolvedValue(BasicItem) });
		ItemOwn.create = jasmine.createSpy().and.returnValue({ get: jest.fn().mockResolvedValue(BasicItem) });
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

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Invalid quantity of items ${quantity}`);
		}
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

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Invalid quantity of items ${quantity}`);
		}
	});

	it('Error case: negative shopId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params.shopId = shop.id_negative_1.toString();
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The shop ${shop.id_negative_1} does not exist`);
		}
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

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The shop ${shop.id_nonexistant_1} does not exist`);
		}
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

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The shop NaN does not exist`);
		}
	});

	it('Error case: negative itemId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params.shopId = shopList.FLYING_SHOP.shopId.toString();
		req.body = {
			itemId: item.id_negative_1.toString(),
			quantity: quantity.toString()
		};

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(
				`The item ${item.id_negative_1} does not exist in the shop ${shopList.FLYING_SHOP.shopId}`
			);
		}
	});

	it('Error case: letter itemId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params.shopId = shopList.FLYING_SHOP.shopId.toString();
		req.body = {
			itemId: item.id_letter_1.toString(),
			quantity: quantity.toString()
		};

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The item NaN does not exist in the shop ${shopList.FLYING_SHOP.shopId}`);
		}
	});

	it('Error case: non-existant itemId', async function () {
		const quantity: number = 1;

		// Change parameters
		req.params.shopId = shopList.FLYING_SHOP.shopId.toString();
		req.body = {
			itemId: item.id_nonexistant_1.toString(),
			quantity: quantity.toString()
		};

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(
				`The item ${item.id_nonexistant_1} does not exist in the shop ${shopList.FLYING_SHOP.shopId}`
			);
		}
	});

	it('Error case: no player found', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 1;

		// Change parameters
		req.params.shopId = shopList.FLYING_SHOP.shopId.toString();
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(null);

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Player ${player.id_1} doesn't exist`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);
	});

	it('Error case: not enough money', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = 1;

		// Change parameters
		req.params.shopId = shopList.FLYING_SHOP.shopId.toString();
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is at the location of the shop
		PlayerTestData.money = 0;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You don't have enough money to buy ${quantity} of the item ${itemPurchased.itemId}`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);
	});

	it('Error case: not enough storage available', async function () {
		const itemPurchased = shopList.FLYING_SHOP.listItemsSold.find(
			item => item.itemId === itemList.POTION_IRMA.itemId
		) as ItemFiche;
		const quantity: number = itemList.POTION_IRMA.maxQuantity + 1;

		// Change parameters
		req.params.shopId = shopList.FLYING_SHOP.shopId.toString();
		req.body = {
			itemId: itemList.POTION_IRMA.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is at the location of the shop
		PlayerTestData.money = 5000000;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You don't have enough storage to buy ${quantity} of the item ${itemPurchased.itemId}`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);
	});

	it('Error case: magic shop & shop keeper, no increased max capcity', async function () {
		const itemPurchased = shopList.MAGIC_SHOP.listItemsSold.find(
			item => item.itemId === itemList.TEAR_OF_LIFE.itemId
		) as ItemFiche;
		const quantity: number = 5;
		const expectedQuantity: number = quantity + playerMagicShopInventory[0].quantity;
		const expectedNapo: number = 999 - quantity * itemPurchased.price;

		// Change parameters
		req.params = {
			shopId: shopList.MAGIC_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.TEAR_OF_LIFE.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add some item to the player test data
		PlayerTestData.itemOwn = playerMagicShopInventory;
		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = placeList.DINOVILLE.placeId;
		PlayerTestData.dinoz.push(DinozTestData);
		PlayerTestData.shopKeeper = true;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You don't have enough storage to buy ${quantity} of the item ${itemPurchased.itemId}`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);
	});

	it.each(Object.values(shopList))('Error case - test all shops access: buyItem from Shop %#', async shopToTest => {
		// Update test data first
		// In case of the magicShop, the player needs golden napodinoz
		if (shopToTest.type === ShopType.MAGICAL) {
			PlayerTestData.itemOwn = [
				{
					itemId: itemList.GOLDEN_NAPODINO.itemId,
					quantity: 999
				}
			] as Array<ItemOwn>;
		}
		PlayerTestData.money = 500000;
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		const quantity: number = 1;
		const itemPurchased: Partial<ItemFiche> = shopToTest.listItemsSold[0];

		// Update parameters
		req.params = {
			shopId: shopToTest.shopId.toString()
		};
		req.body = {
			itemId: itemPurchased.itemId!,
			quantity: quantity.toString()
		};

		// We need to put the test in a try/catch in case an error is returned for better debugging
		try {
			await buyItem(req);
			// Fails for all except the flying shop
			if (shopToTest.shopId !== shopList.FLYING_SHOP.shopId) {
				fail();
			}
		} catch (err) {
			const e: Error = err as Error;
			if (shopToTest.type === ShopType.CURSED) {
				expect(e.message).toBe(`You need a cursed dinoz at the location of the shop to access it`);
			} else {
				expect(e.message).toBe(`You don't have any dinoz at the shop's location ${shopToTest.shopId}`);
			}
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);
	});

	// Corner case of the cursed shop
	it('Error case: dinoz at location of cursed shop but not cursed', async function () {
		const itemPurchased = shopList.CURSED_SHOP.listItemsSold.find(
			item => item.itemId === itemList.PIRHANOZ_IN_BAG.itemId
		) as ItemFiche;
		const quantity: number = 2;

		// Change parameters
		req.params = {
			shopId: shopList.CURSED_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.PIRHANOZ_IN_BAG.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = placeList.RUINES_ASHPOUK.placeId;
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need a cursed dinoz at the location of the shop to access it`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);
	});

	// Corner case of the cursed shop
	it('Error case: dinoz cursed but not at location of cursed shop', async function () {
		const itemPurchased = shopList.CURSED_SHOP.listItemsSold.find(
			item => item.itemId === itemList.PIRHANOZ_IN_BAG.itemId
		) as ItemFiche;
		const quantity: number = 2;

		// Change parameters
		req.params = {
			shopId: shopList.CURSED_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.PIRHANOZ_IN_BAG.itemId.toString(),
			quantity: quantity.toString()
		};

		// Add a dinoz that is cursed but not at the location of the shop
		DinozTestData.status.push({
			statusId: statusList.CURSED
		} as AssDinozStatus);
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopOneItemDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need a cursed dinoz at the location of the shop to access it`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemPurchased.itemId);
	});

	it('Error case shops: magic shop, not enough golden napo', async function () {
		// Update test data first
		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = shopList.MAGIC_SHOP.placeId;

		const quantityToBuy: number = 1;
		const napoQuantity: number = 3;

		// Give the player not enough napodinoz
		PlayerTestData.itemOwn = [
			{
				itemId: itemList.GOLDEN_NAPODINO.itemId,
				quantity: napoQuantity - 1
			}
		] as Array<ItemOwn>;
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		// Update parameters
		req.params = {
			shopId: shopList.MAGIC_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.TEAR_OF_LIFE.itemId.toString(),
			quantity: quantityToBuy.toString()
		};

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You don't have enough golden napodinoz to buy the item ${itemList.TEAR_OF_LIFE.itemId}`);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemList.TEAR_OF_LIFE.itemId);
	});

	it('Error case shops: magic shop, not enough storage', async function () {
		// Update test data first
		// Add a dinoz that is at the location of the shop
		DinozTestData.placeId = shopList.MAGIC_SHOP.placeId;

		const quantityToBuy: number = 5;
		const napoQuantity: number = 999;

		// Give the player enough napodinoz
		PlayerTestData.itemOwn = [
			{
				itemId: itemList.GOLDEN_NAPODINO.itemId,
				quantity: napoQuantity
			}
		] as Array<ItemOwn>;
		PlayerTestData.dinoz.push(DinozTestData);
		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerShopItemsDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		// Update parameters
		req.params = {
			shopId: shopList.MAGIC_SHOP.shopId.toString()
		};
		req.body = {
			itemId: itemList.TEAR_OF_LIFE.itemId.toString(),
			quantity: quantityToBuy.toString()
		};

		try {
			await buyItem(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(
				`You don't have enough storage to buy ${quantityToBuy} of the item ${itemList.TEAR_OF_LIFE.itemId}`
			);
		}

		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerShopOneItemDataRequest).toHaveBeenCalledWith(player.id_1, itemList.TEAR_OF_LIFE.itemId);
	});
});
