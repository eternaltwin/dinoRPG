import { Request } from 'express';
import { addPlayerMoney, getPlayerInventoryDataRequest } from '../dao/playerDao.js';
import { Dinoz, DinozItem, DinozSkill, Player, PlayerItem } from '../entity/index.js';
import { itemList } from '../constants/item.js';
import { getActiveDinoz, getDinozEquipItemRequest, getDinozFicheItemRequest, setDinoz } from '../dao/dinozDao.js';
import { changeItemQuantity, createItemDataRequest, useItemDataRequest } from '../dao/playerItemDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { DinozItems } from '@drpg/core/models/item/DinozItems';
import gameConfig from '../config/game.config.js';
import { getRandomLetter } from '../utils/index.js';
import { DinozSkillFiche } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { skillList, statusList } from '../constants/index.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { applySkillEffect } from './skillService.js';
import { removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { addItemToDinoz, removeItemToDinoz } from '../dao/dinozItemDao.js';

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
			canBeEquipped: theItem.canBeEquipped,
			effect: theItem.effect
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
			await setDinoz(dinoz.heal(item.effect.value));
			break;
		case ItemEffect.RESURRECT:
			await setDinoz(dinoz.resurrect());
			break;
		case ItemEffect.EGG:
			await hatchEgg(item.effect.race, item.effect.rare, req.user!.playerId);
			break;
		case ItemEffect.SPHERE:
			const skillToLearn = dinoz.learnNextSphereSkill(item.effect.value);
			await applySkillEffect(dinoz, Object.values(skillList).find(skill => skill.skillId === skillToLearn)!);
			await addSkillToDinoz(new DinozSkill(new Dinoz(dinozId), skillToLearn));
			break;
		case ItemEffect.GOLD:
			await addPlayerMoney(dinoz.player.id, item.effect.value);
			break;
		case ItemEffect.SPECIAL:
			await useSpecialItem(dinoz, item);
			break;
		default:
			throw new ErrorFormator(500, 'WTF');
	}
	await useItemDataRequest(dinoz.player.id, item.itemId);
}

async function hatchEgg(race: DinozRace, rare: boolean, playerId: number): Promise<void> {
	//Check if player can hatch dinoz
	const dinozActive: Array<Dinoz> | undefined = await getActiveDinoz(playerId);

	if (dinozActive.length > 0) {
		if (!dinozActive[0].player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
		if (
			dinozActive[0].player.leader &&
			dinozActive.length >= gameConfig.dinoz.maxQuantity + gameConfig.dinoz.leaderBonus
		) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
	}

	//generate display
	let randomDisplay: string = race.swfLetter;
	for (let i = 0; i < 14; i++) {
		randomDisplay += getRandomLetter(race.display![i]);
	}

	if (rare) {
		randomDisplay =
			randomDisplay.substring(0, 13) + getRandomLetter('9') + getRandomLetter('9') + randomDisplay.substring(15);
	}

	const newDinoz = new Dinoz(race.name, new Player(playerId), randomDisplay);

	// Create a new dinoz that belongs to player
	const dinozCreated: Dinoz = await setDinoz(newDinoz);

	const skillsToAdd: Array<DinozSkillFiche> = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await Promise.all(skillsToAdd.map(skill => addSkillToDinoz(new DinozSkill(dinozCreated, skill.skillId))));
}

async function useSpecialItem(dinoz: Dinoz, item: ItemFiche): Promise<void> {
	if (item.effect?.category !== ItemEffect.SPECIAL) return;
	switch (item.effect.value) {
		case 'ointment':
			if (!dinoz.status.some(status => status.statusId === statusList.CURSED)) {
				throw new ErrorFormator(400, `NotCursed`);
			}
			await removeStatusToDinoz(dinoz.id, statusList.CURSED);
			break;
		case 'rice':
			await setDinoz(dinoz.useRice);
			break;
		case 'pampleboum':
			await setDinoz(dinoz.heal(15));
			if (!dinoz.player.items.find(item => item.itemId === itemList.PAMPLEBOUM_PIT.itemId))
				await createItemDataRequest(new PlayerItem(dinoz.player, itemList.PAMPLEBOUM_PIT.itemId, 1));
			else await changeItemQuantity(dinoz.player.id, itemList.PAMPLEBOUM_PIT.itemId, 1);
			break;
		default:
			throw new ErrorFormator(500, `Special item with ${item.effect.value} value is not implemented`);
	}
	return;
}

export async function equipItem(req: Request): Promise<Array<DinozItems>> {
	const dinozId: number = parseInt(req.params.dinozId);
	const dinoz: Dinoz = await getDinozEquipItemRequest(dinozId);
	const itemId: number = parseInt(req.body.itemId);
	const equip: boolean = req.body.equip;
	const itemToEquip = Object.values(itemList).find(item => item.itemId === itemId);

	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.user!.playerId}`);
	}

	if (!itemToEquip) {
		throw new ErrorFormator(500, `This item doesn't exist`);
	}

	if (!itemToEquip.canBeEquipped) {
		throw new ErrorFormator(500, `Item n°${itemToEquip.itemId} cannot be equiped`);
	}

	//TODO: check if it's a magical item, if yes look if there isn't already one equiped

	const playerItem = dinoz.player.items.find(item => item.itemId === itemId)?.quantity ?? 0;

	if (playerItem === 0 && equip) {
		throw new ErrorFormator(500, `You don't have enought ${itemToEquip.itemId}`);
	}

	if (dinoz.backpackSlot <= dinoz.items.length && equip) {
		throw new ErrorFormator(400, `backpackFull`);
	}

	const dinozItem = dinoz.items.find(item => item.itemId === itemId);

	if (!dinozItem && !equip) {
		throw new ErrorFormator(500, `This dinoz don't have this item equiped`);
	}

	if (equip) {
		await useItemDataRequest(dinoz.player.id, itemId);
		dinoz.items.push(await addItemToDinoz(new DinozItem(new Dinoz(dinoz.id), itemId)));
	} else {
		await removeItemToDinoz(dinozItem!.id);
		await changeItemQuantity(dinoz.player.id, itemId, 1);
		const itemIndex = dinoz.items.findIndex(item => item.id === dinozItem!.id);
		dinoz.items.splice(itemIndex, 1);
	}
	return dinoz.items.map(item => {
		return { itemId: item.itemId };
	});
}
