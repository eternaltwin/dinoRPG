import { Request } from 'express';
import { ItemFiche, ItemType, ShopFiche, ShopType } from '../models/index.js';
import { Player, PlayerItem } from '../entity/index.js';
import { createItemDataRequest, updateItemDataRequest } from '../dao/playerItemDao.js';
import {
	getPlayerShopItemsDataRequest,
	getPlayerShopOneItemDataRequest,
	setPlayerMoneyRequest
} from '../dao/playerDao.js';
import { itemList, placeList, shopList, statusList } from '../constants/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * @summary Get all items from a shop
 * @param req
 * @param req.params.shopId {string} ShopId
 * @return Array<ItemFiche>
 */
const getItemsFromShop = async (req: Request): Promise<Array<ItemFiche>> => {
	const playerId: number = req.user!.playerId!;
	const shopId: number = parseInt(req.params.shopId);
	const tempShop: ShopFiche | undefined = Object.values(shopList).find(shop => shop.shopId === shopId);

	// Throw an exception if the shop does not exist
	if (tempShop === undefined) {
		throw new ErrorFormator(500, `The shop ${shopId} does not exist`);
	}

	// Get the player's data (money, shopKeeper, list of dinoz not frozen or sacrificed (placeId), list of items (quantity))
	const playerShopData: Player = await getPlayerShopItemsDataRequest(playerId);

	checkDinozPlace(tempShop, playerShopData, shopId);

	// All checks passed, let's create the list of items with the proper values
	return tempShop.listItemsSold.map(itemSold => {
		// Get the item data if the player has it
		const itemPlayer: PlayerItem | undefined = playerShopData.items.find(
			playerItem => playerItem.itemId === itemSold.itemId
		);
		// Get the reference of the items from the constants
		const itemReference: ItemFiche = Object.values(itemList).find(item => item.itemId === itemSold.itemId)!;
		// Return a new item object with its properties set accordingly to the player's unique skills and data
		return {
			itemId: itemReference.itemId,
			// Merchant works only for the flying shop also called Dinoland's shop
			price:
				playerShopData.merchant && tempShop.shopId === shopList.FLYING_SHOP.shopId
					? Math.round(itemSold.price! * 0.9)
					: itemSold.price!,
			quantity: itemPlayer ? itemPlayer.quantity : 0,
			// ShopKeeper does not work for magical items
			maxQuantity:
				playerShopData.shopKeeper && itemReference.itemType !== ItemType.MAGICAL
					? Math.round(itemReference.maxQuantity * 1.5)
					: itemReference.maxQuantity,
			canBeUsedNow: itemReference.canBeUsedNow,
			canBeEquipped: itemReference.canBeEquipped,
			itemType: itemReference.itemType,
			isRare: itemReference.isRare
		};
	});
};

/**
 * @summary Buy an item
 * @param req
 * @param req.params.shopId {string} ShopId
 * @param req.body.itemId {string} Item to buy
 * @param req.body.quantity {string} Quantity to buy
 * @return void
 */
const buyItem = async (req: Request): Promise<void> => {
	const playerId: number = req.user!.playerId!;
	const shopId: number = parseInt(req.params.shopId);
	const itemId: number = parseInt(req.body.itemId);
	const quantityBought: number = parseInt(req.body.quantity);

	// Get the player's data (money, shopKeeper, list of dinoz not frozen and not sacrificed (placeId),
	// the info about the item, and owned golden napodinos)
	const playerShopData: Player = await getPlayerShopOneItemDataRequest(playerId, itemId);

	// Extract item data from player
	const playerItemData: PlayerItem | undefined = playerShopData.items.find(item => item.itemId === itemId);

	// Throw an exception if somehow we have a negative or zero quantity
	if (quantityBought <= 0) {
		throw new ErrorFormator(400, 'wrongQuantity');
	}

	const theShop: ShopFiche | undefined = Object.values(shopList).find(shop => shop.shopId === shopId);
	// Throw an exception if the shop does not exist
	if (!theShop) {
		throw new ErrorFormator(500, `The shop ${shopId} does not exist`);
	}

	checkDinozPlace(theShop, playerShopData, shopId);

	// Get the item from the shop list
	const itemSold: Partial<ItemFiche> | undefined = theShop.listItemsSold.find(item => item.itemId === itemId)!;
	// Throw an exception if the item does not exist in the shop list of items
	if (itemSold === undefined) {
		throw new ErrorFormator(500, `The item ${itemId} does not exist in the shop ${shopId}`);
	}

	// All checks passed, now do the checks specific to normal and magic items

	// Get the reference of the item from the constants
	const itemReference: ItemFiche = Object.values(itemList).find(item => item.itemId === itemId)!;

	// Create the item that will be purchased (id, price, quantity, maxQuantity)
	// Update its properties accordingly to the player's unique skills and data
	const itemToBuy: Partial<ItemFiche> = {
		itemId: itemReference.itemId,
		// Merchant works only for the flying shop also called Dinoland's shop
		price:
			playerShopData.merchant && theShop.shopId === shopList.FLYING_SHOP.shopId
				? Math.round(itemSold.price! * 0.9)
				: itemSold.price!,
		quantity: playerItemData ? quantityBought + playerItemData.quantity! : quantityBought,
		// ShopKeeper does not work for magical items
		maxQuantity:
			playerShopData.shopKeeper && itemReference.itemType !== ItemType.MAGICAL
				? Math.round(itemReference.maxQuantity * 1.5)
				: itemReference.maxQuantity
	};

	// To avoid making this function bigger, use buyMagicItem if the shop is magical
	if (theShop.type === ShopType.MAGICAL) {
		await buyMagicItem(playerShopData, itemSold, itemReference, quantityBought, playerItemData);
	} else {
		// Throws an exception if player doesn't have enough money to buy the items
		if (playerShopData.money < itemToBuy.price! * quantityBought) {
			throw new ErrorFormator(400, 'notEnoughMoney');
		}

		// Throws an exception if the player does not have enough storage space left
		if (itemToBuy.quantity! > itemToBuy.maxQuantity!) {
			throw new ErrorFormator(400, 'notEnoughMoney');
		}

		// All checks passed related to gold, let's update the stuff

		// Set player money
		const newMoney: number = playerShopData.money - itemToBuy.price! * quantityBought;
		await setPlayerMoneyRequest(playerId, newMoney);
	}

	// Continue updating stuff that is common to normal and magic items

	// Add items to the player's inventory
	// Update entry if it already exists
	// Note: itemToBuy can be re-used here regardless of the type of shop and item
	if (playerItemData) {
		await updateItemDataRequest(playerId, itemToBuy.itemId!, itemToBuy.quantity!);
	}
	// Else create it
	else {
		const newItem = new PlayerItem();
		newItem.player = playerShopData;
		newItem.itemId = itemToBuy.itemId!;
		newItem.quantity = itemToBuy.quantity!;
		await createItemDataRequest(newItem);
	}
};

/**
 * @summary Buy an item
 * @param playerShopData {Player} the data of the player
 * @param itemSold {Partial<ItemFiche>} The item that the player is trying to buy
 * @param itemReference{ItemFiche} Reference of the item from the constants
 * @param quantityBought {number} Quantity to buy
 * @param playerItemData {PlayerItem | undefined} data of the item if the player already has some
 * @return void
 */
async function buyMagicItem(
	playerShopData: Player,
	itemSold: Partial<ItemFiche>,
	itemReference: ItemFiche,
	quantityBought: number,
	playerItemData: PlayerItem | undefined
): Promise<void> {
	// Get the number of golden napodinos owned by the player
	const playerNapoData: PlayerItem | undefined = playerShopData.items.find(
		item => item.itemId === itemList.GOLDEN_NAPODINO.itemId
	);

	// Create the item that will be purchased (id, price, quantity, maxQuantity)
	const magicalItemToBuy: Partial<ItemFiche> = {
		itemId: itemReference.itemId,
		price: itemSold.price!,
		quantity: playerItemData ? quantityBought + playerItemData.quantity! : quantityBought,
		maxQuantity: itemReference.maxQuantity
	};

	// Throws an exception if player doesn't have enough money to buy the items
	if (playerNapoData === undefined || playerNapoData!.quantity! < magicalItemToBuy.price! * quantityBought) {
		throw new ErrorFormator(400, 'notEnoughMoney');
	}

	// Throws an exception if the player does not have enough storage space left
	if (magicalItemToBuy.quantity! > magicalItemToBuy.maxQuantity!) {
		throw new ErrorFormator(400, 'notEnoughStorage');
	}

	// All checks passed related to magic item, let's update the stuff

	// Set player golden napodino count
	const newNapoCount: number = playerNapoData!.quantity! - magicalItemToBuy.price! * quantityBought;
	await updateItemDataRequest(playerShopData.id, itemList.GOLDEN_NAPODINO.itemId, newNapoCount);
}

// Check if player can access the shop
// The check is done for the shops that are not accessible from anywhere (i.e does not apply to the flying shop)
function checkDinozPlace(theShop: ShopFiche, player: Player, shopId: number): void {
	if (theShop.placeId !== placeList.ANYWHERE.placeId) {
		// For cursed shops, the player needs a non frozen, non sacrificed dinoz with the curse status at the location of the shop
		if (theShop.type == ShopType.CURSED) {
			const hasCursedDinozAtShop = player.dinoz.some(
				dinoz => dinoz.status.some(status => status.statusId === statusList.CURSED) && dinoz.placeId === theShop.placeId
			);
			if (!hasCursedDinozAtShop) {
				throw new ErrorFormator(500, `You need a cursed dinoz at the location of the shop to access it`);
			}
		} else {
			// Check at least one dinoz that is not frozen or sacrificed is at the location of the shop
			if (!player.dinoz.some(dinoz => dinoz.placeId === theShop.placeId)) {
				throw new ErrorFormator(500, `You don't have any dinoz at the shop's location ${shopId}`);
			}
		}
	}
}

export { getItemsFromShop, buyItem };
