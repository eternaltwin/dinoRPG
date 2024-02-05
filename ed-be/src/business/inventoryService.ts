import { Request } from 'express';
import { addMoney, getPlayerInventoryDataRequest } from '../dao/playerDao.js';
import {
	createDinoz,
	getActiveDinoz,
	getDinozEquipItemRequest,
	getDinozFicheItemRequest,
	updateDinoz
} from '../dao/dinozDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { DinozItems } from '@drpg/core/models/item/DinozItems';
import gameConfig from '../config/game.config.js';
import { getRandomLetter } from '../utils/index.js';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { addMultipleSkillToDinoz, addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { applySkillEffect } from './skillService.js';
import { removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { addItemToDinoz, removeItemFromDinoz } from '../dao/dinozItemDao.js';
import { itemList } from '@drpg/core/models/item/ItemList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import {
	backpackSlot,
	heal,
	initializeDinoz,
	learnNextSphereSkill,
	resurrect,
	useRice
} from '@drpg/core/utils/DinozUtils';
import { Dinoz, DinozStatus, LogType, Player, PlayerItem } from '@drpg/prisma';
import { createLog } from '../dao/logDao.js';
import { updateDinozCount } from '../dao/rankingDao.js';
import { boxOpening } from '../utils/boxesLogic.js';
import { ItemFeedBack } from '@drpg/core/models/item/feedBack';

/**
 * @summary Get all items from the inventory of a player
 * @param req
 */
export async function getAllItemsData(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	const playerId: number = req.auth.playerId;

	// Get the player's data (shopKeeper)
	const playerInventoryData = await getPlayerInventoryDataRequest(playerId);

	if (!playerInventoryData) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	// All checks passed, let's create a list of the items owned by the player
	const allItemsDataReply: ItemFiche[] = playerInventoryData.items?.map(i => {
		// Look for the item constant with the same id to get its information (maxQuantity, canBeEquipped, etc.)
		const theItem = Object.values(itemList).find(item => item.itemId === i.itemId);

		if (!theItem) {
			throw new ErrorFormator(500, `Item ${i.itemId} doesn't exist.`);
		}

		// Push a new item object with its properties accordingly to the player's unique skills and data
		return {
			name: itemNameList[theItem.itemId],
			price: theItem.price,
			itemId: theItem.itemId,
			quantity: playerInventoryData ? i.quantity : 0,
			maxQuantity:
				playerInventoryData.shopKeeper && theItem.itemType !== ItemType.MAGICAL
					? Math.round(theItem.maxQuantity * 1.5)
					: theItem.maxQuantity,
			canBeUsedNow: theItem.canBeUsedNow,
			canBeEquipped: theItem.canBeEquipped,
			effect: theItem.effect,
			itemType: theItem.itemType,
			isRare: theItem.isRare
		};
	});

	return allItemsDataReply;
}

export async function useItem(req: Request) {
	//The Promise need to be reworked
	const dinozId = +req.params.dinozId;
	const dinoz = await getDinozFicheItemRequest(dinozId);
	if (!dinoz) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}
	const itemId = +req.params.itemId;
	const item = Object.values(itemList).find(item => item.itemId === itemId);

	if (!dinoz.player || !req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	// If player found is different from player who do the request, throw exception
	if (dinoz.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (item === undefined) {
		throw new ErrorFormator(500, `This item didn't exist`);
	}

	const itemData = dinoz.player.items.find(item => item.itemId === itemId);
	if (itemData === undefined || itemData.quantity <= 0) {
		throw new ErrorFormator(400, `notEnoughItem`);
	}

	let feedback: ItemFeedBack;
	switch (item.effect?.category) {
		case ItemEffect.ACTION:
			await updateDinoz(dinoz.id, {
				fight: true,
				gather: true
			});
			feedback = {
				category: ItemEffect.ACTION
			};
			break;
		case ItemEffect.HEAL:
			await updateDinoz(dinoz.id, heal(dinoz, item.effect.value));
			feedback = {
				category: ItemEffect.HEAL,
				value: dinoz.maxLife - dinoz.life > item.effect.value ? item.effect.value : dinoz.maxLife - dinoz.life
			};
			break;
		case ItemEffect.RESURRECT:
			await updateDinoz(dinoz.id, resurrect(dinoz));
			feedback = {
				category: ItemEffect.RESURRECT
			};
			break;
		case ItemEffect.EGG:
			await hatchEgg(item.effect.race, item.effect.rare, req.auth.playerId);
			feedback = {
				category: ItemEffect.EGG,
				value: item.effect.race.name
			};
			break;
		case ItemEffect.SPHERE:
			const skillToLearn = learnNextSphereSkill(dinoz, item.effect.value);
			const skill = Object.values(skillList).find(skill => skill.id === skillToLearn);

			if (!skill) {
				throw new ErrorFormator(500, `Skill ${skillToLearn} doesn't exist.`);
			}

			await applySkillEffect(dinoz, skill);
			await addSkillToDinoz(dinozId, skillToLearn);
			feedback = {
				category: ItemEffect.SPHERE,
				value: skill.name
			};
			break;
		case ItemEffect.GOLD:
			await addMoney(dinoz.player.id, item.effect.value);
			feedback = {
				category: ItemEffect.GOLD,
				value: item.effect.value
			};
			break;
		case ItemEffect.SPECIAL:
			const itemWon = await useSpecialItem(dinoz, item);
			const itemName = Object.entries(itemList).find(itema => itema[1].itemId === item.itemId);
			feedback = {
				category: ItemEffect.SPECIAL,
				value: itemName ? itemName[0].toLowerCase() : '',
				effect: itemWon ?? ''
			};
			break;
		default:
			throw new ErrorFormator(500, 'WTF');
	}

	await decreaseItemQuantity(dinoz.player.id, itemData.itemId, 1);

	await createLog(LogType.ItemUsed, dinoz.player.id, dinoz.id, itemData.itemId.toString(), '1');
	return feedback;
}

async function hatchEgg(race: DinozRace, rare: boolean, playerId: number) {
	if (!race.display) {
		throw new ErrorFormator(500, 'Missing race display');
	}
	//Check if player can hatch dinoz
	const dinozActive = await getActiveDinoz(playerId);

	const player = dinozActive[0].player;

	if (!player) {
		throw new ErrorFormator(500, `Player missing`);
	}

	if (dinozActive.length > 0) {
		if (!player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
		if (player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity + gameConfig.dinoz.leaderBonus) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
	}

	//generate display
	let randomDisplay = race.swfLetter;
	for (let i = 0; i < 14; i++) {
		randomDisplay += getRandomLetter(race.display[i]);
	}

	if (rare) {
		randomDisplay =
			randomDisplay.substring(0, 13) + getRandomLetter('9') + getRandomLetter('9') + randomDisplay.substring(15);
	}

	// Create a new dinoz that belongs to player
	const dinozCreated = await createDinoz(initializeDinoz(race, playerId, randomDisplay));

	const skillsToAdd: SkillDetails[] = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await addMultipleSkillToDinoz(
		dinozCreated.id,
		skillsToAdd.map(skill => skill.id)
	);
	await updateDinozCount(playerId, 1);
}

async function useSpecialItem(
	dinoz: Pick<Dinoz, 'id' | 'life' | 'maxLife'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		player:
			| (Pick<Player, 'id'> & {
					items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
			  })
			| null;
	},
	item: ItemFiche
) {
	if (!dinoz.player) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to a player.`);
	}

	if (item.effect?.category !== ItemEffect.SPECIAL) return;
	switch (item.effect.value) {
		case 'ointment':
			if (!dinoz.status.some(status => status.statusId === DinozStatusId.CURSED)) {
				throw new ErrorFormator(400, `NotCursed`);
			}
			await removeStatusFromDinoz(dinoz.id, DinozStatusId.CURSED);
			return 'ointment';
		case 'rice':
			await updateDinoz(dinoz.id, useRice(dinoz));
			return 'rice';
		case 'pampleboum':
			await updateDinoz(dinoz.id, heal(dinoz, 15));
			const pamp = dinoz.player.items.find(item => item.itemId === itemList.PAMPLEBOUM_PIT.itemId);
			if (!pamp) await insertItem(dinoz.player.id, { itemId: itemList.PAMPLEBOUM_PIT.itemId, quantity: 1 });
			else await increaseItemQuantity(dinoz.player.id, itemList.PAMPLEBOUM_PIT.itemId, 1);
			return 'pampleboum';
		case 'box':
			if (!item.name) {
				throw new ErrorFormator(500, `Special item with ${item.effect.value} value is not implemented`);
			}
			const boxOpened = boxOpening(item);
			const newItem = dinoz.player.items.find(item => item.itemId === boxOpened.itemId);
			if (!newItem) await insertItem(dinoz.player.id, { itemId: boxOpened.itemId, quantity: 1 });
			else await increaseItemQuantity(dinoz.player.id, boxOpened.itemId, 1);
			const wonItem = Object.entries(itemList).find(item => item[1].itemId === boxOpened.itemId);
			return wonItem ? wonItem[0].toLowerCase() : '';
		default:
			throw new ErrorFormator(500, `Special item with ${item.effect.value} value is not implemented`);
	}
}

export async function equipItem(req: Request): Promise<DinozItems[]> {
	const dinozId = +req.params.dinozId;
	const dinoz = await getDinozEquipItemRequest(dinozId);
	if (!dinoz) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}
	const itemId = +req.body.itemId;
	const equip = !!req.body.equip;
	const itemToEquip = Object.values(itemList).find(item => item.itemId === itemId);

	if (!dinoz.player || !req.auth || dinoz.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.auth?.playerId}`);
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

	if (backpackSlot(dinoz) <= dinoz.items.length && equip) {
		throw new ErrorFormator(400, `backpackFull`);
	}

	const dinozItem = dinoz.items.find(item => item.itemId === itemId);
	const item = dinoz.player.items.find(item => item.itemId === itemId);

	if (!dinozItem && !equip) {
		throw new ErrorFormator(500, `This dinoz don't have this item equiped`);
	}

	if (equip) {
		await decreaseItemQuantity(dinoz.player.id, item.itemId, 1);
		dinoz.items.push(await addItemToDinoz(dinoz.id, item.itemId));
	} else {
		if (!dinozItem) throw new ErrorFormator(500, `This dinoz doesn't have this item equiped`);
		await removeItemFromDinoz(dinoz.id, dinozItem.itemId);
		await increaseItemQuantity(dinoz.player.id, item.itemId, 1);
		const itemIndex = dinoz.items.findIndex(item => item.id === dinozItem.id);
		dinoz.items.splice(itemIndex, 1);
	}
	return dinoz.items.map(item => {
		return { itemId: item.itemId };
	});
}
