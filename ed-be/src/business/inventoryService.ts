import { Request, Response } from 'express';
import { getPlayerInventoryDataRequest } from '../dao/playerDao.js';
import { Player, ItemFiche, ItemOwn } from '../models/index';
import { itemList } from '../constants/item.js';
import { validationResult } from 'express-validator';

/**
 * Get all items from the inventory of a player
 * @return Array<ItemFiche>
 */

const getAllItemsData = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const playerId: number = req.user!.playerId!;

	// Get the player's data (shopkeeper)
	const playerInventoryData: Player | null = await getPlayerInventoryDataRequest(
		playerId
	);

	// Throw an exception if the player does not exist
	if (playerInventoryData === null) {
		return res.status(500).send(`Player ${playerId} doesn't exist`);
	}

	const allItemsData: Array<ItemOwn> | undefined = playerInventoryData.itemOwn;

	// All checks passed, let's create a list of the items owned by the player
	let allItemsDataReply: Array<ItemFiche> = [];
	allItemsData?.forEach(i => {
		// Look for the item constant with the same id to get its information (maxQuantity, canBeEquipped, etc.)
		const theItem: ItemFiche = Object.values(itemList).find(
			item => item.itemId === i.itemId
		)!;
		// Push a new item object with its properties accordingly to the player's unique skills and data
		allItemsDataReply.push({
			itemId: theItem.itemId,
			quantity: playerInventoryData ? i.quantity : 0,
			maxQuantity: playerInventoryData.shopKeeper
				? Math.round(theItem.maxQuantity * 1.5)
				: theItem.maxQuantity,
			canBeUsedNow: theItem.canBeUsedNow,
			canBeEquipped: theItem.canBeEquipped
		} as ItemFiche);
	});

	return res.status(200).send(allItemsDataReply);
};

export { getAllItemsData };
