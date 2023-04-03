import { Request } from 'express';
import { getPlayerInventoryDataRequest } from '../dao/playerDao.js';
import { Dinoz, Player } from '../entity/index.js';
import { itemList } from '../constants/item.js';
import { addLife, getDinozFicheItemRequest } from '../dao/dinozDao.js';
import { useItemDataRequest } from '../dao/playerItemDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';

/**
 * @summary Get all items from the inventory of a player
 * @param req
 * @return Array<ItemFiche>
 */
export async function getAllItemsData(req: Request): Promise<Array<ItemFiche>> {
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
}

export async function useItem(req: Request): Promise<void> {
	//The Promise need to be reworked
	const dinozId: number = parseInt(req.params.dinozId);
	const dinoz: Dinoz = await getDinozFicheItemRequest(dinozId);
	const itemId: number = parseInt(req.params.itemId);
	const item: ItemFiche | undefined = Object.values(itemList).find(item => item.itemId === itemId);

	// If player found is different from player who do the request, throw exception
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (item === undefined) {
		throw new ErrorFormator(500, `This item didn't exist`);
	}

	const itemData = dinoz.player.items.find(item => item.itemId === itemId);
	if (itemData === undefined || itemData.quantity <= 0) {
		throw new ErrorFormator(500, `You don't have enough of item ${itemId}`);
	}

	switch (item.effect?.category) {
		case ItemEffect.HEAL:
			const lifeAdded = dinoz.maxLife - dinoz.life > item.effect.value ? item.effect.value : dinoz.maxLife - dinoz.life;
			if (lifeAdded === 0) {
				throw new ErrorFormator(400, 'AlreadyAtMaxHealth');
			}
			if (dinoz.life === 0) {
				throw new ErrorFormator(400, 'DinozIsDead');
			}
			await addLife(dinoz.id, lifeAdded);
			await useItemDataRequest(dinoz.player.id, item.itemId);
			break;
		case ItemEffect.RESURRECT:
			if (dinoz.life > 0) {
				throw new ErrorFormator(400, 'DinozNotDead');
			}
			await addLife(dinoz.id, 1);
			await useItemDataRequest(dinoz.player.id, item.itemId);
			break;
		default:
			throw new ErrorFormator(500, 'WTF');
	}
}
