import { Request, Response } from 'express';
import { getAllItemsDataRequest } from '../dao/inventoryDao.js';
import { ItemFiche } from '../models/item/ItemFiche.js';
import { itemList } from '../constants/item.js';

const getAllItemsData = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const allItemsData = (await getAllItemsDataRequest(
		req.user!.playerId!
	)) as Array<ItemFiche> | null;

	let allItemsDataReply: Array<ItemFiche> = [];
	allItemsData?.forEach(i => {
		// Look for item constant with the same id and fill in the rest of the information
		// TODO: put a try/catch
		const tempItem: ItemFiche = Object.values(itemList).find(
			item => item.itemId === i.itemId
		)!;
		// Change the quantity by the value from the database.
		tempItem.quantity = i.quantity;
		// TODO multiply maxQuantity by 1.5 if the player has a dino with shop keeper
		allItemsDataReply.push(tempItem);
	});

	return res.status(200).send(allItemsDataReply);
};

export { getAllItemsData };
