import { Request } from 'express';
import { getPlayerInventoryDataRequest } from '../dao/playerDao.js';
import { Player } from '../entity/index.js';
import { ItemFiche, ItemType } from '../models/index.js';
import { itemList } from '../constants/item.js';

/**
 * @summary Get all items from the inventory of a player
 * @param req
 * @return Array<ItemFiche>
 */
const getAllItemsData = async (req: Request): Promise<Array<ItemFiche>> => {
	const playerId: number = req.user!.playerId!;

	// Get the player's data (shopKeeper)
	const playerInventoryData: Player = await getPlayerInventoryDataRequest(playerId);

	// All checks passed, let's create a list of the items owned by the player
	const allItemsDataReply: Array<ItemFiche> = playerInventoryData.items?.map(i => {
		// Look for the item constant with the same id to get its information (maxQuantity, canBeEquipped, etc.)
		const theItem: ItemFiche = Object.values(itemList).find(item => item.itemId === i.itemId)!;
		// Push a new item object with its properties accordingly to the player's unique skills and data
		return {
			itemId: theItem.itemId,
			quantity: playerInventoryData ? i.quantity : 0,
			maxQuantity:
				playerInventoryData.shopKeeper && theItem.itemType !== ItemType.MAGICAL
					? Math.round(theItem.maxQuantity * 1.5)
					: theItem.maxQuantity,
			canBeUsedNow: theItem.canBeUsedNow,
			canBeEquipped: theItem.canBeEquipped
		} as ItemFiche;
	});

	return allItemsDataReply;
};

export { getAllItemsData };
