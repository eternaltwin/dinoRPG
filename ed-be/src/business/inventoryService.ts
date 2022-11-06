import { Request } from 'express';
import { getPlayerInventoryDataRequest } from '../dao/playerDao.js';
import { Dinoz, Player } from '../entity/index.js';
import { ItemEffect, ItemFiche, ItemType } from '../models/index.js';
import { itemList } from '../constants/item.js';
import { addLife, getDinozFicheRequest } from '../dao/dinozDao.js';
import { useItemDataRequest } from '../dao/playerItemDao.js';

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

const useItem = async (req: Request): Promise<string> => {
	//The Promise need to be reworked
	const dinozId: number = parseInt(req.params.dinozId);
	const dinoz: Dinoz = await getDinozFicheRequest(dinozId);
	const itemId: number = parseInt(req.params.itemId);
	const item: ItemFiche = Object.values(itemList).find(item => item.itemId === itemId)!;

	switch (item.effect?.class) {
		case ItemEffect.HEAL:
			const lifeAdded = dinoz.maxLife - dinoz.life > item.effect.value ? item.effect.value : dinoz.maxLife - dinoz.life;
			if (lifeAdded === 0) {
				return 'Dinoz is at max health'; //Replace by a key to translate in the front
			}
			await addLife(dinoz.id, lifeAdded);
			await useItemDataRequest(dinoz.player.id, item.itemId);
			break;
		case ItemEffect.RESURRECT:
			if (dinoz.life > 0){
				return 'Dinoz cannot be resurrected'; //Replace by a key to translate in the front
			}
			await addLife(dinoz.id, 1);
			await useItemDataRequest(dinoz.player.id, item.itemId);
			break;
		default:
			break;
	}

	return 'ok'; //Default return when everything is ok, maybe change it
};

export { getAllItemsData, useItem };
