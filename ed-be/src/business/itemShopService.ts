import { Request, Response } from 'express';
import { ShopFiche, ItemFiche, Player, ItemOwn } from '../models/index.js';
import {
	createItemDataRequest,
	updateItemDataRequest
} from '../dao/inventoryDao.js';
import {
	getPlayerShopItemsDataRequest,
	getPlayerShopOneItemDataRequest,
	setPlayerMoneyRequest
} from '../dao/playerDao.js';
import { shopList } from '../constants/shop.js';
import { placeList } from '../constants/place.js';
import { validationResult } from 'express-validator';

/**
 * @summary Get all items from a shop
 * @param req
 * @param req.params.shopId {string} ShopId
 * @param res {Array<ItemFiche>}
 * @return Array<ItemFiche>
 */
const getItemsFromShop = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const playerId: number = req.user!.playerId!;
	const shopId: number = parseInt(req.params.shopId);
	const tempShop: ShopFiche | undefined = Object.values(shopList).find(
		shop => shop.shopId === shopId
	)!;

	// Throw an exception if the shop does not exist
	if (tempShop === undefined) {
		return res.status(500).send(`The shop ${shopId} does not exist`);
	}

	// Get the player's data (money, shopkeeper, list of dinoz not frozen or sacrificed (placeId), list of items (quantity))
	const playerShopData: Player | null = await getPlayerShopItemsDataRequest(
		playerId
	);

	// Throw an exception if the player does not exist
	if (playerShopData === null) {
		return res.status(500).send(`Player ${playerId} doesn't exist`);
	}

	// The check is done for the shops that are not accessible from anywhere (i.e does not apply to the flying shop)
	if (tempShop.placeId !== placeList.ANYWHERE.placeId) {
		// Check at least one dinoz that is not frozen or sacrificed is at the location of the shop
		if (
			!playerShopData.dinoz.some(dinoz => dinoz.placeId === tempShop.placeId)
		) {
			return res.status(500).send(`You cannot access the shop ${shopId}`);
		}
	}

	// All checks passed, let's create the list of items with the proper values
	const listItems: Array<ItemFiche> = [];
	tempShop.listItemsSold.forEach(item => {
		// Get the item data if the player has it
		const playerHasItem: ItemOwn | undefined = playerShopData.itemOwn.find(
			playerItem => playerItem.itemId === item.itemId
		);
		// Push a new item object with its properties accordingly to the player's unique skills and data
		listItems.push({
			itemId: item.itemId,
			price: playerShopData?.merchant
				? Math.round(item.price * 0.9)
				: item.price,
			quantity: playerHasItem ? playerHasItem.quantity : 0,
			maxQuantity: playerShopData?.shopKeeper
				? Math.round(item.maxQuantity * 1.5)
				: item.maxQuantity,
			canBeUsedNow: item.canBeUsedNow,
			canBeEquipped: item.canBeEquipped
		} as ItemFiche);
	});

	return res.status(200).send(listItems);
};

/**
 * @summary Buy an item
 * @param req
 * @param req.params.shopId {string} ShopId
 * @param req.body.itemId {string} Item to buy
 * @param req.body.quantity {string} Quantity to buy
 * @param res
 * @return void
 */
const buyItem = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const playerId: number = req.user!.playerId!;
	const shopId: number = parseInt(req.params.shopId);
	const itemId: number = parseInt(req.body.itemId);
	const quantityBought: number = parseInt(req.body.quantity);

	// Checking all variables first before calling DB

	// Throw an exception if somehow we have a negative or zero quantity
	if (quantityBought <= 0) {
		return res.status(500).send(`Invalid quantity of items ${quantityBought}`);
	}

	const theShop: ShopFiche | undefined = Object.values(shopList).find(
		shop => shop.shopId === shopId
	)!;
	// Throw an exception if the shop does not exist
	if (theShop === undefined) {
		return res.status(500).send(`The shop ${shopId} does not exist`);
	}

	const theItem: ItemFiche | undefined = theShop.listItemsSold.find(
		item => item.itemId === itemId
	)!;
	// Throw an exception if the item does not exist in the shop list of items
	if (theItem === undefined) {
		return res
			.status(500)
			.send(`The item ${itemId} does not exist in the shop ${shopId}`);
	}

	// Get the player's data (money, shopkeeper, list of dinoz not frozen or sacrificed (placeId), list of items (quantity))
	const playerShopData: Player | null = await getPlayerShopOneItemDataRequest(
		playerId,
		itemId
	);

	// Throw an exception if the player does not exist
	if (playerShopData === null) {
		return res.status(500).send(`Player ${playerId} doesn't exist`);
	}

	// Extract item data from player
	const playerItemData = playerShopData.itemOwn.find(
		item => item.itemId === itemId
	) as ItemFiche | undefined;

	// Create the item that will be purchased (id, price, quantity, maxQQuantity)
	// Update its properties accordingly to the player's unique skills and data
	const itemToBuy = {
		itemId: theItem.itemId,
		price: playerShopData.merchant
			? Math.round(theItem.price * 0.9)
			: theItem.price,
		quantity: playerItemData
			? quantityBought + playerItemData.quantity!
			: quantityBought,
		maxQuantity: playerShopData.shopKeeper
			? Math.round(theItem.maxQuantity * 1.5)
			: theItem.maxQuantity
	} as ItemFiche;

	// Throws an exception if player doesn't have enough money to buy the items
	if (playerShopData.money < itemToBuy.price * quantityBought) {
		return res
			.status(500)
			.send(
				`You don't have enough money to buy ${quantityBought} of the item ${itemToBuy.itemId}`
			);
	}

	// Throws an exception if the player does not have enough storage space left
	if (itemToBuy.quantity! > itemToBuy.maxQuantity) {
		return res
			.status(500)
			.send(
				`You don't have enough storage to buy ${itemToBuy.quantity} of the item ${itemToBuy.itemId}`
			);
	}

	// The check is done for the shops that are not accessible from anywhere (i.e does not apply to the flying shop)
	if (theShop.placeId !== placeList.ANYWHERE.placeId) {
		// Check at least one dinoz that is not frozen or sacrificed is at the location of the shop
		if (
			!playerShopData.dinoz.some(dinoz => dinoz.placeId === theShop.placeId)
		) {
			return res.status(500).send(`You cannot access the shop ${shopId}`);
		}
	}

	// All checks passed, let's update the stuff

	// Set player money
	const newMoney: number =
		playerShopData.money - itemToBuy.price * quantityBought;
	await setPlayerMoneyRequest(playerId, newMoney);

	// Add items to the player's inventory
	// Update entry if it already exists
	if (playerItemData) {
		await updateItemDataRequest(
			playerId,
			itemToBuy.itemId,
			itemToBuy.quantity!
		);
	}
	// Else create it
	else {
		const newItem: ItemOwn = ItemOwn.build({
			playerId: playerId,
			itemId: itemToBuy.itemId,
			quantity: itemToBuy.quantity
		});
		await createItemDataRequest(newItem.get());
	}

	return res.status(200).send();
};

export { getItemsFromShop, buyItem };
