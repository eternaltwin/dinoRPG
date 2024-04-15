import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { itemList } from '@drpg/core/models/item/ItemList';
import { ShopFiche } from '@drpg/core/models/shop/ShopFiche';
import { Dinoz, DinozStatus, LogType, PlayerItem } from '@drpg/prisma';
import { Request } from 'express';
import { shopList } from '../constants/index.js';
import { createLog } from '../dao/logDao.js';
import { getPlayerShopItemsDataRequest, getPlayerShopOneItemDataRequest, removeMoney } from '../dao/playerDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

/**
 * @summary Get all items from a shop
 * @param req
 * @param req.params.shopId {string} ShopId
 * @return Array<ItemFiche>
 */
export async function getItemsFromShop(req: Request): Promise<ItemFiche[]> {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	const playerId = req.auth.playerId;
	const shopId = +req.params.shopId;
	const tempShop = Object.values(shopList).find(shop => shop.shopId === shopId);

	// Throw an exception if the shop does not exist
	if (tempShop === undefined) {
		throw new ErrorFormator(500, `The shop ${shopId} does not exist`);
	}

	// Get the player's data (money, shopKeeper, list of dinoz not frozen or sacrificed (placeId), list of items (quantity))
	const playerShopData = await getPlayerShopItemsDataRequest(playerId);

	if (!playerShopData) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	checkDinozPlace(tempShop, playerShopData, shopId);

	// All checks passed, let's create the list of items with the proper values
	return tempShop.listItemsSold.map(itemSold => {
		// Get the item data if the player has it
		const itemPlayer = playerShopData.items.find(playerItem => playerItem.itemId === itemSold.itemId);
		// Get the reference of the items from the constants
		const itemReference = Object.values(itemList).find(item => item.itemId === itemSold.itemId);

		if (!itemReference) {
			throw new ErrorFormator(500, `Item ${itemSold.itemId} doesn't exist.`);
		}

		if (!itemSold.price) {
			throw new ErrorFormator(500, `Item ${itemSold.itemId} doesn't have a price.`);
		}

		// Return a new item object with its properties set accordingly to the player's unique skills and data
		return {
			itemId: itemReference.itemId,
			// Merchant works only for the flying shop also called Dinoland's shop
			price:
				playerShopData.merchant && tempShop.shopId === shopList.FLYING_SHOP.shopId
					? Math.round(itemSold.price * 0.9)
					: itemSold.price,
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
}

/**
 * @summary Buy an item
 * @param req
 * @param req.params.shopId {string} ShopId
 * @param req.body.itemId {string} Item to buy
 * @param req.body.quantity {string} Quantity to buy
 * @return void
 */
export async function buyItem(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}
	const playerId = req.auth.playerId;
	const shopId = +req.params.shopId;
	const itemId = +req.body.itemId;
	const quantityBought = +req.body.quantity;

	// Get the player's data (money, shopKeeper, list of dinoz not frozen and not sacrificed (placeId),
	// the info about the item, and owned golden napodinos)
	const playerShopData = await getPlayerShopOneItemDataRequest(playerId, itemId);

	if (!playerShopData) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}
	// Extract item data from player
	const playerItemData = playerShopData.items.find(item => item.itemId === itemId);

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
	const itemSold = theShop.listItemsSold.find(item => item.itemId === itemId);
	// Throw an exception if the item does not exist in the shop list of items
	if (itemSold === undefined) {
		throw new ErrorFormator(500, `The item ${itemId} does not exist in the shop ${shopId}`);
	}

	// All checks passed, now do the checks specific to normal and magic items

	// Get the reference of the item from the constants
	const itemReference = Object.values(itemList).find(item => item.itemId === itemId);

	if (!itemReference) {
		throw new ErrorFormator(500, `Item ${itemId} doesn't exist.`);
	}

	if (!itemSold.price) {
		throw new ErrorFormator(500, `Item ${itemId} doesn't have a price.`);
	}

	itemReference.price =
		playerShopData.merchant && theShop.shopId === shopList.FLYING_SHOP.shopId
			? Math.round(itemSold.price * 0.9)
			: itemSold.price;
	itemReference.quantity = playerItemData ? playerItemData.quantity : quantityBought;
	// ShopKeeper does not work for magical items
	itemReference.maxQuantity =
		playerShopData.shopKeeper && itemReference.itemType !== ItemType.MAGICAL
			? Math.round(itemReference.maxQuantity * 1.5)
			: itemReference.maxQuantity;

	// To avoid making this function bigger, use buyMagicItem if the shop is magical
	if (theShop.type === ShopType.MAGICAL) {
		await buyMagicItem(playerId, playerShopData, itemReference, quantityBought, playerItemData);
	} else {
		// Throws an exception if player doesn't have enough money to buy the items
		if (playerShopData.money < itemReference.price * quantityBought) {
			throw new ErrorFormator(400, 'notEnoughMoney');
		}

		// Throws an exception if the player does not have enough storage space left
		if (itemReference.quantity > itemReference.maxQuantity) {
			throw new ErrorFormator(400, 'notEnoughStorage');
		}

		// All checks passed related to gold, let's update the stuff

		await removeMoney(playerId, itemReference.price * quantityBought);
	}

	// Continue updating stuff that is common to normal and magic items

	// Add items to the player's inventory
	// Update entry if it already exists
	// Note: itemToBuy can be re-used here regardless of the type of shop and item
	if (playerItemData) {
		await increaseItemQuantity(
			playerId,
			itemReference.itemId,
			itemReference.quantity + quantityBought <= itemReference.maxQuantity
				? quantityBought
				: itemReference.maxQuantity - itemReference.quantity
		);
	}
	// Else create it
	else {
		await insertItem(playerId, { itemId: itemReference.itemId, quantity: itemReference.quantity });
	}

	await createLog(
		LogType.ItemBought,
		playerId,
		undefined,
		itemReference.itemId.toString(),
		itemReference.quantity.toString()
	);

	return {
		itemId: itemReference.itemId,
		quantity: quantityBought,
		gold: theShop.type === ShopType.MAGICAL ? undefined : itemReference.price * quantityBought
	};
}

/**
 * @summary Buy an item
 * @param playerId {number} Id of the player
 * @param playerShopData {Player} the data of the player
 * @param itemSold {Partial<ItemFiche>} The item that the player is trying to buy
 * @param itemReference{ItemFiche} Reference of the item from the constants
 * @param quantityBought {number} Quantity to buy
 * @param playerItemData {PlayerItem | undefined} data of the item if the player already has some
 * @return void
 */
async function buyMagicItem(
	playerId: number,
	playerShopData: {
		items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
	},
	itemSold: ItemFiche,
	quantityBought: number,
	playerItemData: Pick<PlayerItem, 'quantity'> | undefined
) {
	// Get the number of golden napodinos owned by the player
	const playerNapoData = playerShopData.items.find(item => item.itemId === itemList.GOLDEN_NAPODINO.itemId);

	itemSold.quantity = playerItemData ? quantityBought + playerItemData.quantity : quantityBought;

	// Throws an exception if player doesn't have enough money to buy the items
	if (playerNapoData === undefined || playerNapoData.quantity < itemSold.price * quantityBought) {
		throw new ErrorFormator(400, 'notEnoughMoney');
	}

	// Throws an exception if the player does not have enough storage space left
	if (itemSold.quantity > itemSold.maxQuantity) {
		throw new ErrorFormator(400, 'notEnoughStorage');
	}

	// Set player golden napodino count
	await decreaseItemQuantity(playerId, itemList.GOLDEN_NAPODINO.itemId, itemSold.price * quantityBought);
}

// Check if player can access the shop
// The check is done for the shops that are not accessible from anywhere (i.e does not apply to the flying shop)
function checkDinozPlace(
	theShop: ShopFiche,
	player: {
		dinoz: (Pick<Dinoz, 'placeId'> & {
			status: Pick<DinozStatus, 'statusId'>[];
		})[];
	},
	shopId: number
) {
	if (theShop.placeId !== PlaceEnum.ANYWHERE) {
		// For cursed shops, the player needs a non frozen, non sacrificed dinoz with the curse status at the location of the shop
		if (theShop.type == ShopType.CURSED) {
			const hasCursedDinozAtShop = player.dinoz.some(
				dinoz =>
					dinoz.status.some(status => status.statusId === DinozStatusId.CURSED) && dinoz.placeId === theShop.placeId
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
