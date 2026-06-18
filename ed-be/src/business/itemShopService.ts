import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { ItemShopFiche, ItemShopType, ShopFiche } from '@drpg/core/models/shop/ShopFiche';
import { shopList } from '@drpg/core/models/shop/ShopList';
import { Dinoz, DinozStatus, LogType, PlayerItem } from '@drpg/prisma';
import { Request } from 'express';
import { createLog } from '../dao/logDao.js';
import { auth, getPlayerShopItemsDataRequest, getPlayerShopOneItemDataRequest, removeMoney } from '../dao/playerDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { decreaseIngredientQuantity, getIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/server/translate.js';
import { Player } from '@drpg/prisma';

/**
 * @summary Get all items from a shop
 * @param req
 * @param req.params.shopId {string} ShopId
 * @return Array<ItemFiche>
 */
export async function getItemsFromShop(req: Request): Promise<ItemShopFiche[]> {
	const authed = await auth(req);

	const playerId = authed.id;
	const shopId = +req.params.shopId;
	const tempShop = Object.values(shopList).find(shop => shop.shopId === shopId);

	// Throw an exception if the shop does not exist
	if (tempShop === undefined) {
		throw new ExpectedError(`The shop ${shopId} does not exist`);
	}

	// Get the player's data (money, shopKeeper, list of dinoz not frozen or sacrificed (placeId), list of items (quantity))
	const playerShopData = await getPlayerShopItemsDataRequest(playerId);

	if (!playerShopData) {
		throw new ExpectedError(`Player ${playerId} doesn't exist.`);
	}

	checkDinozPlace(tempShop, playerShopData, shopId);

	/*	if (tempShop.type === ShopType.ITINERANT) {
		throw new ExpectedError( `Wrong shop returned`);
	}*/

	// All checks passed, let's create the list of items with the proper values
	return tempShop.listItemsSold.map(itemSold => {
		// Get the item data if the player has it
		let itemPlayer;
		if (itemSold.type === ItemShopType.ITEM) {
			itemPlayer = playerShopData.items.find(playerItem => playerItem.itemId === itemSold.id);
		} else {
			itemPlayer = playerShopData.ingredients.find(playerItem => playerItem.ingredientId === itemSold.id);
		}

		// Return a new item object with its properties set accordingly to the player's unique skills and data
		return {
			id: itemSold.id,
			price:
				playerShopData.merchant && tempShop.shopId === shopList.FLYING_SHOP.shopId
					? Math.round(itemSold.price * 0.9)
					: itemSold.price,
			quantity: itemPlayer ? itemPlayer.quantity : 0,
			type: itemSold.type
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
	const authed = await auth(req);
	const shopId = +req.params.shopId;
	const itemId = +req.body.itemId;
	const quantityBought = +req.body.quantity;

	// Get the player's data (money, shopKeeper, list of dinoz not frozen and not sacrificed (placeId),
	// the info about the item, and owned golden napodinos)
	const playerShopData = await getPlayerShopOneItemDataRequest(authed.id, itemId);

	if (!playerShopData) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}
	// Extract item data from player
	const playerItemData = playerShopData.items.find(item => item.itemId === itemId);

	// Throw an exception if somehow we have a negative or zero quantity
	if (quantityBought <= 0) {
		throw new ExpectedError(translate('wrongQuantity', authed));
	}

	const theShop: ShopFiche | undefined = Object.values(shopList).find(shop => shop.shopId === shopId);
	// Throw an exception if the shop does not exist
	if (!theShop) {
		throw new ExpectedError(`The shop ${shopId} does not exist`);
	}

	/*	if (theShop.type === ShopType.ITINERANT || theShop.type === ShopType.FILOU) {
		throw new ExpectedError( `Wrong shop returned.`);
	}*/

	checkDinozPlace(theShop, playerShopData, shopId);

	// Get the item from the shop list
	const itemSold = theShop.listItemsSold.find(item => item.id === itemId);
	// Throw an exception if the item does not exist in the shop list of items
	if (itemSold === undefined) {
		throw new ExpectedError(`The item ${itemId} does not exist in the shop ${shopId}`);
	}

	// All checks passed, now do the checks specific to normal and magic items

	// Get the reference of the item from the constants
	const itemReference = structuredClone(Object.values(itemList).find(item => item.itemId === itemId));

	if (!itemReference) {
		throw new ExpectedError(`Item ${itemId} doesn't exist.`);
	}

	itemReference.price =
		playerShopData.merchant && theShop.shopId === shopList.FLYING_SHOP.shopId
			? Math.round(itemSold.price * 0.9)
			: itemSold.price;
	itemReference.quantity = playerItemData ? playerItemData.quantity : 0;
	// ShopKeeper does not work for magical items
	itemReference.maxQuantity =
		playerShopData.shopKeeper && itemReference.itemType !== ItemType.MAGICAL
			? Math.round(itemReference.maxQuantity * 1.5)
			: itemReference.maxQuantity;

	// To avoid making this function bigger, use buyMagicItem if the shop is magical
	if (theShop.type === ShopType.MAGICAL) {
		await buyMagicItem(authed, playerShopData, itemReference, quantityBought, playerItemData);
	} else if (theShop.type === ShopType.FILOU) {
		const itemFromShop = shopList.FILOU.listItemsSold.find(i => i.id === itemId);
		if (!itemFromShop) {
			throw new ExpectedError(`The item ${itemId} is not sellable for coupons!`);
		}
		const playerIngredient = await getIngredientsDataRequest(authed.id, itemId);
		if (!playerIngredient || playerIngredient.quantity < itemFromShop.price * quantityBought) {
			throw new ExpectedError(`You don't have enough for purchassing this quantity of coupons!`);
		}
		await decreaseIngredientQuantity(authed.id, itemReference.itemId, itemFromShop.price * quantityBought);
		const playerTreasure = playerShopData.items.find(item => item.itemId === itemList[Item.TREASURE_COUPON].itemId);
		if (!playerTreasure) {
			await insertItem(authed.id, { itemId: itemList[Item.TREASURE_COUPON].itemId, quantity: quantityBought });
		} else {
			await increaseItemQuantity(authed.id, itemList[Item.TREASURE_COUPON].itemId, quantityBought);
		}

		await createLog(
			LogType.ItemBought,
			authed.id,
			undefined,
			itemList[Item.TREASURE_COUPON].itemId.toString(),
			quantityBought,
			playerTreasure ? playerTreasure.quantity + quantityBought : quantityBought
		);

		//Update stats
		await setSpecificStat(StatTracking.S_BUYER, authed.id, quantityBought);
		return {
			itemId: itemList[Item.TREASURE_COUPON].itemId,
			quantity: quantityBought,
			gold: quantityBought
		};
	} else {
		// Throws an exception if player doesn't have enough money to buy the items
		if (playerShopData.money < itemReference.price * quantityBought) {
			throw new ExpectedError(translate('notEnoughMoney', authed));
		}

		// Throws an exception if the player does not have enough storage space left
		if (itemReference.quantity + quantityBought > itemReference.maxQuantity) {
			throw new ExpectedError(translate('notEnoughStorage', authed));
		}

		// All checks passed related to gold, let's update the stuff

		await removeMoney(authed.id, itemReference.price * quantityBought);
	}

	// Continue updating stuff that is common to normal and magic items

	// Add items to the player's inventory
	// Update entry if it already exists
	// Note: itemToBuy can be re-used here regardless of the type of shop and item
	if (playerItemData) {
		await increaseItemQuantity(authed.id, itemReference.itemId, quantityBought);
	}
	// Else create it
	else {
		await insertItem(authed.id, { itemId: itemReference.itemId, quantity: quantityBought });
	}

	await createLog(
		LogType.ItemBought,
		authed.id,
		undefined,
		itemReference.itemId.toString(),
		quantityBought,
		itemReference.quantity + quantityBought // new total
	);

	//Update stats
	await setSpecificStat(StatTracking.S_BUYER, authed.id, quantityBought);

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
	authed: Pick<Player, 'id' | 'lang'>,
	playerShopData: {
		items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
	},
	itemSold: ItemFiche,
	quantityBought: number,
	playerItemData: Pick<PlayerItem, 'quantity'> | undefined
) {
	// Get the number of golden napodinos owned by the player
	const playerNapoData = playerShopData.items.find(item => item.itemId === itemList[Item.GOLDEN_NAPODINO].itemId);

	itemSold.quantity = playerItemData ? quantityBought + playerItemData.quantity : quantityBought;

	// Throws an exception if player doesn't have enough money to buy the items
	if (playerNapoData === undefined || playerNapoData.quantity < itemSold.price * quantityBought) {
		throw new ExpectedError(translate('notEnoughNapo', authed));
	}

	// Throws an exception if the player does not have enough storage space left
	if (itemSold.quantity > itemSold.maxQuantity) {
		throw new ExpectedError(translate('notEnoughStorage', authed));
	}

	// Set player golden napodino count
	await decreaseItemQuantity(authed.id, itemList[Item.GOLDEN_NAPODINO].itemId, itemSold.price * quantityBought);
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
				throw new ExpectedError(`You need a cursed dinoz at the location of the shop to access it`);
			}
		} else {
			// Check at least one dinoz that is not frozen or sacrificed is at the location of the shop
			if (!player.dinoz.some(dinoz => dinoz.placeId === theShop.placeId)) {
				throw new ExpectedError(`You don't have any dinoz at the shop's location ${shopId}`);
			}
		}
	}
}
