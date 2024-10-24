import { Request } from 'express';
import { addMoney, auth, getPlayerInventoryDataRequest } from '../dao/playerDao.js';
import {
	createDinoz,
	getActiveDinoz,
	getDinozEquipItemRequest,
	getDinozFicheItemRequest,
	updateDinoz
} from '../dao/dinozDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { ItemFiche, ItemFicheDTO } from '@drpg/core/models/item/ItemFiche';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { DinozItems } from '@drpg/core/models/item/DinozItems';
import gameConfig from '../config/game.config.js';
import { getRandomNumber, getLetter, getRandomLetter } from '../utils/index.js';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { addMultipleSkillToDinoz, addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { applySkillEffect } from './skillService.js';
import { removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { addItemToDinoz, removeItemFromDinoz } from '../dao/dinozItemDao.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { backpackSlot, initializeDinoz, learnNextSphereSkill, useRice } from '@drpg/core/utils/DinozUtils';
import { Dinoz, DinozStatus, LogType, Player, PlayerItem } from '@drpg/prisma';
import { createLog } from '../dao/logDao.js';
import { updateDinozCount, updatePoints } from '../dao/rankingDao.js';
import { boxOpening } from '../utils/boxesLogic.js';
import { ItemFeedBack } from '@drpg/core/models/item/feedBack';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { Scenario } from '@drpg/core/models/enums/Scenario';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import dayjs from 'dayjs';
import { updateQuest } from '../dao/questsDao.js';
import { GLOBAL } from '../context.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';

/**
 * @summary Get all items from the inventory of a player
 * @param req
 */
export async function getAllItemsData(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized.`);
	}

	const playerId: number = req.auth.playerId;

	// Get the player's data (shopKeeper)
	const playerInventoryData = await getPlayerInventoryDataRequest(playerId);

	if (!playerInventoryData) {
		throw new ExpectedError(`Player ${playerId} doesn't exist.`);
	}

	// All checks passed, let's create a list of the items owned by the player
	const allItemsDataReply: ItemFicheDTO[] = playerInventoryData.items?.map(i => {
		// Look for the item constant with the same id to get its information (maxQuantity, canBeEquipped, etc.)
		const theItem = Object.values(itemList).find(item => item.itemId === i.itemId);

		if (!theItem) {
			throw new ExpectedError(`Item ${i.itemId} doesn't exist.`);
		}

		// Push a new item object with its properties accordingly to the player's unique skills and data
		return {
			id: theItem.itemId,
			price: theItem.price,
			quantity: playerInventoryData ? i.quantity : 0,
			maxQuantity:
				playerInventoryData.shopKeeper && theItem.itemType !== ItemType.MAGICAL
					? Math.round(theItem.maxQuantity * 1.5)
					: theItem.maxQuantity
		};
	});

	return allItemsDataReply;
}

export async function useItem(req: Request) {
	//The Promise need to be reworked
	const authed = await auth(req);
	const dinozId = +req.params.dinozId;
	const dinoz = await getDinozFicheItemRequest(dinozId);
	if (!dinoz || !dinoz.player) {
		throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
	}
	const itemId = +req.params.itemId;
	const item = Object.values(itemList).find(item => item.itemId === itemId);

	// If player found is different from player who do the request, throw exception
	if (dinoz.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (item === undefined) {
		throw new ExpectedError(`This item didn't exist`);
	}

	const itemData = dinoz.player.items.find(item => item.itemId === itemId);
	if (itemData === undefined || itemData.quantity <= 0) {
		throw new ExpectedError(translate(`notEnoughItem`, authed));
	}

	//Star quest
	const starQuest = dinoz.player.quests.find(q => q.questId === Scenario.STAR && q.progression === 3);
	if (starQuest) {
		// Current date
		const currentDate = dayjs();
		// Retrieve the day of the week (0 pour dimanche, 1 pour lundi, ..., 6 pour samedi)
		const dayOfWeek = currentDate.day();
		if (
			(dayOfWeek === 4 || dayOfWeek === 6) &&
			dinoz.placeId === PlaceEnum.MARAIS_COLLANT &&
			itemId === itemList[Item.MEAT_PIE].itemId
		) {
			await updateQuest(dinoz.player.id, Scenario.STAR, 4);
			await increaseItemQuantity(dinoz.player.id, itemList[Item.MAGIC_STAR].itemId, 1);
			const initialLife = dinoz.life;
			await updateDinoz(dinoz.id, heal(dinoz, 30 * (dinoz.player.cooker ? 1.1 : 1)));
			const lifeHealed = Math.max(0, dinoz.life - initialLife);
			//Update stats
			await setSpecificStat(StatTracking.HEAL_PV, dinoz.player.id, lifeHealed);
			await decreaseItemQuantity(dinoz.player.id, itemData.itemId, 1);
			await createLog(LogType.ItemUsed, dinoz.player.id, dinoz.id, itemData.itemId.toString(), '1');
			return {
				category: ItemEffect.QUEST,
				value: 'eat_star_found'
			};
		}
	}

	let feedback: ItemFeedBack;
	switch (item.effect?.category) {
		case ItemEffect.ACTION:
			await updateDinoz(dinoz.id, {
				fight: true,
				gather: true
			});
			feedback = {
				category: ItemEffect.ACTION,
				value: 1
			};
			break;
		case ItemEffect.HEAL:
			const initialLife = dinoz.life;
			await updateDinoz(dinoz.id, heal(dinoz, item.effect.value * (dinoz.player.cooker ? 1.1 : 1)));
			const lifeHealed = Math.max(0, dinoz.life - initialLife);
			feedback = {
				category: ItemEffect.HEAL,
				value: lifeHealed
			};
			//Update stats
			await setSpecificStat(StatTracking.HEAL_PV, dinoz.player.id, lifeHealed);
			break;
		case ItemEffect.RESURRECT:
			await updateDinoz(dinoz.id, resurrect(dinoz));
			feedback = {
				category: ItemEffect.RESURRECT
			};
			//Update stats
			await setSpecificStat(StatTracking.DEATHS, dinoz.player.id, 1);
			break;
		case ItemEffect.EGG:
			await hatchEgg(item, authed);
			feedback = {
				category: ItemEffect.EGG,
				value: item.effect.race.name
			};
			break;
		case ItemEffect.SPHERE:
			const skillToLearn = learnNextSphereSkill(dinoz, item.effect.value);
			const skill = Object.values(skillList).find(skill => skill.id === skillToLearn);

			if (!skill) {
				throw new ExpectedError(`Skill ${skillToLearn} doesn't exist.`);
			}

			await applySkillEffect(dinoz, skill, dinoz.player.id);
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
			const itemName = itemList[item.itemId as Item];
			feedback = {
				category: ItemEffect.SPECIAL,
				value: itemName.name.toLowerCase(),
				effect: itemWon ?? ''
			};
			break;
		default:
			throw new ExpectedError('WTF');
	}

	await decreaseItemQuantity(dinoz.player.id, itemData.itemId, 1);

	await createLog(LogType.ItemUsed, dinoz.player.id, dinoz.id, itemData.itemId.toString(), '1');
	return feedback;
}

async function hatchEgg(item: ItemFiche, authed: Pick<Player, 'id' | 'lang'>) {
	if (!item || !item.effect || item.effect.category != ItemEffect.EGG) {
		throw new ExpectedError('Missing item, egg effect or item is not an egg');
	}
	let race = item.effect.race;

	//Check if player can hatch dinoz
	const dinozActive = await getActiveDinoz(authed.id);

	const player = dinozActive[0].player;

	if (!player) {
		throw new ExpectedError(`Player missing`);
	}

	if (dinozActive.length > 0) {
		const maxDinoz = gameConfig.dinoz.maxQuantity + (player.leader ? 3 : 0) + (player.messie ? 3 : 0);
		if (dinozActive.length >= maxDinoz) {
			throw new ExpectedError(translate('tooManyActiveDinoz', authed));
		}
	}

	let randomDisplay = '0';

	// Each rare egg has a different hatching
	switch (item.itemId) {
		case itemList[Item.MOUEFFE_EGG_RARE].itemId:
			// Suit
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.PIGMOU_EGG_RARE].itemId:
			// Body tatoo
			randomDisplay = generateDinozDisplay(race, getRandomNumber(0, 5) === 0 ? '1' : '0', '1', '0');
			break;
		case itemList[Item.WINKS_EGG_RARE].itemId:
			// Fore-head horn thingy
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.PLANAILLE_EGG_RARE].itemId:
			// More hair and big eyes
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.CASTIVORE_EGG_RARE].itemId:
			// Bow-tie
			randomDisplay = generateDinozDisplay(race, '1', getLetter(1 + getRandomNumber(0, 2)), '0');
			break;
		case itemList[Item.ROCKY_EGG_RARE].itemId:
			// Just color palette, no other graphical rare stuff in swf
			randomDisplay = generateDinozDisplay(race, '1', '0', '0');
			break;
		case itemList[Item.PTEROZ_EGG_RARE].itemId:
			// TODO does not exist in MT's code: invent or remove. Currently placeholder.
			// Note: there does not seem to be a rare thingy for the pteroz in the swf
			// Color palette has no effect
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.NUAGOZ_EGG_RARE].itemId:
			// Just color palette
			randomDisplay = generateDinozDisplay(race, '1', '0', '0');
			break;
		case itemList[Item.SIRAIN_EGG_RARE].itemId:
			// Scarf & tatoo
			randomDisplay = generateDinozDisplay(race, getRandomNumber(0, 5) === 0 ? '1' : '0', '1', '0');
			break;
		case itemList[Item.HIPPOCLAMP_EGG_RARE].itemId:
			// TODO does not exist in MT's code: invent or remove. Currently placeholder.
			// Note: there does not seem to be a rare thingy for the hippoclamp in the swf
			// Color palette has no effect
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.GORILLOZ_EGG_RARE].itemId:
			// Elvis Presley hairstyle
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.WANWAN_EGG_RARE].itemId:
			// TODO does not exist in MT's code: invent or just use the baby rare. Currently placeholder
			// Note: there does not seem to be another rare thingy for the wanwan in the swf
			// Note 2: Could go for color palette 1 and rare 1, instead of 2,1
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.WANWAN_BABY_RARE].itemId:
			// Naruto 9-tail style
			randomDisplay = generateDinozDisplay(race, '2', '1', '0');
			break;
		case itemList[Item.SANTAZ_EGG_RARE].itemId:
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.FEROSS_EGG_RARE].itemId:
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.FEROSS_EGG_CHRISTMAS].itemId:
			randomDisplay = generateDinozDisplay(race, '2', '2', '0');
			break;
		case itemList[Item.RARE_KABUKI_EGG].itemId:
			randomDisplay = generateDinozDisplay(race, getRandomNumber(0, 5) === 0 ? '1' : '0', '1', '0');
			break;
		case itemList[Item.RARE_MAHAMUTI_EGG].itemId:
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.SOUFFLET_EGG_RARE].itemId:
			// TODO: does not exist in MT's code: remove or check swf. Currently a placeholder
			// Note: there does not seem to be a rare thingy for the hippoclamp in the swf
			// Color palette has no effect
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.TOUFUFU_BABY_RARE].itemId:
			randomDisplay = generateDinozDisplay(race, '0', '1', '0');
			break;
		case itemList[Item.QUETZU_EGG_RARE].itemId:
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		// Classic smog egg can get color palette to 0 or 1
		case itemList[Item.SMOG_EGG].itemId:
			randomDisplay = generateDinozDisplay(race, getRandomNumber(0, 2) === 0 ? '1' : '0', '0', '0');
			break;
		case itemList[Item.SMOG_EGG_RARE].itemId:
			// TODO: does not exist in MT's code: invent or just use the anniversary format. Currently placeholder
			randomDisplay = generateDinozDisplay(race, '0', '2', '0');
			break;
		case itemList[Item.SMOG_EGG_ANNIVERSARY].itemId:
			// Wings and goggles
			randomDisplay = generateDinozDisplay(race, '0', '2', '0');
			break;
		case itemList[Item.SMOG_EGG_CHRISTMAS_BLUE].itemId:
			// Elf-like boots
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.SMOG_EGG_CHRISTMAS_GREEN].itemId:
			// Ear-warmer
			randomDisplay = generateDinozDisplay(race, '1', '3', '0');
			break;
		case itemList[Item.TRICERAGNON_EGG_BABY].itemId:
			// Note: does not exist in MT's code, but does in the swf
			// Saddle and motorbike handles
			randomDisplay = generateDinozDisplay(race, '1', '1', '0');
			break;
		case itemList[Item.CHRISTMAS_EGG].itemId:
			if (getRandomNumber(0, 3) === 0) {
				race = raceList.TRICERAGNON;
				randomDisplay = generateDinozDisplay(race, '0', '0', '0');
			} else {
				race = raceList.SANTAZ;
				randomDisplay = generateDinozDisplay(race, '0', getRandomLetter('1'), '0');
			}
			break;
		default:
			// Same hatching for non rare eggs that just uses the race
			// We know it's an egg at this point and not any item
			randomDisplay = generateDinozDisplay(race, '0', '0', '0');
			break;
	}

	// Create a new dinoz that belongs to player
	const dinozCreated = await createDinoz(
		initializeDinoz(race, authed.id, randomDisplay, authed.id + GLOBAL.config.salt)
	);

	const skillsToAdd: SkillDetails[] = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await addMultipleSkillToDinoz(
		dinozCreated.id,
		skillsToAdd.map(skill => skill.id)
	);
	await updateDinozCount(authed.id, 1);
	await updatePoints(authed.id, 1);
}

function generateDinozDisplay(race: DinozRace, palette: string, rare_1: string, rare_2: string) {
	// Generate display:
	// - the first 2 chars are the race's chars
	// - the next 11 chars are random between '0' and 'z'
	// - the next (14th) is the provided color palette
	// - the next (15th) is the provided 1st rare visual attribute
	// - the last one (16h) is the provided 2nd rare visual attribute
	let randomDisplay = race.swfLetter;

	for (let i = 0; i < 11; i++) {
		randomDisplay += getRandomLetter('z');
	}

	randomDisplay += palette + rare_1 + rare_2;
	return randomDisplay;
}

async function useSpecialItem(
	dinoz: Pick<Dinoz, 'id' | 'life' | 'maxLife'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		player:
			| (Pick<Player, 'id' | 'cooker' | 'lang'> & {
					items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
			  })
			| null;
	},
	item: ItemFiche
) {
	if (!dinoz.player) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to a player.`);
	}

	if (item.effect?.category !== ItemEffect.SPECIAL) return;
	switch (item.effect.value) {
		case 'ointment':
			if (!dinoz.status.some(status => status.statusId === DinozStatusId.CURSED)) {
				throw new ExpectedError(translate(`NotCursed`, dinoz.player));
			}
			await removeStatusFromDinoz(dinoz.id, DinozStatusId.CURSED);
			return 'ointment';
		case 'rice':
			await updateDinoz(dinoz.id, useRice(dinoz));
			return 'rice';
		case 'pampleboum':
			const healed = heal(dinoz, 15 * (dinoz.player.cooker ? 1.1 : 1));
			await updateDinoz(dinoz.id, healed);
			const pamp = dinoz.player.items.find(item => item.itemId === itemList[Item.PAMPLEBOUM_PIT].itemId);
			if (!pamp) await insertItem(dinoz.player.id, { itemId: itemList[Item.PAMPLEBOUM_PIT].itemId, quantity: 1 });
			else await increaseItemQuantity(dinoz.player.id, itemList[Item.PAMPLEBOUM_PIT].itemId, 1);

			//Update stats
			await setSpecificStat(StatTracking.HEAL_PV, dinoz.player.id, healed.life);
			return 'pampleboum';
		case 'box':
			if (!item.name) {
				throw new ExpectedError(`Special item with ${item.effect.value} value is not implemented`);
			}
			const boxOpened = boxOpening(item);
			const newItem = dinoz.player.items.find(item => item.itemId === boxOpened.item.itemId);
			if (!newItem) await insertItem(dinoz.player.id, { itemId: boxOpened.item.itemId, quantity: boxOpened.quantity });
			else await increaseItemQuantity(dinoz.player.id, boxOpened.item.itemId, boxOpened.quantity);
			const wonItem = itemList[boxOpened.item.itemId as Item];
			return wonItem.name.toLowerCase();
		default:
			throw new ExpectedError(`Special item with ${item.effect.value} value is not implemented`);
	}
}

export async function equipItem(req: Request): Promise<DinozItems[]> {
	const dinozId = +req.params.dinozId;
	const authed = await auth(req);
	const dinoz = await getDinozEquipItemRequest(dinozId);
	if (!dinoz) {
		throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
	}
	const itemId = +req.body.itemId;
	const equip = !!req.body.equip;
	const itemToEquip = Object.values(itemList).find(item => item.itemId === itemId);

	if (!dinoz.player || dinoz.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to player ${req.auth?.playerId}`);
	}

	if (!itemToEquip) {
		throw new ExpectedError(`This item doesn't exist`);
	}

	if (!itemToEquip.canBeEquipped) {
		throw new ExpectedError(`Item n°${itemToEquip.itemId} cannot be equiped`);
	}

	if (equip && itemToEquip.itemType === ItemType.MAGICAL) {
		let magicalItemsEquipped = 0;
		dinoz.items.forEach(item => {
			if (itemList[item.itemId as Item].itemType === ItemType.MAGICAL) {
				magicalItemsEquipped++;
			}
		});

		const magicalItemsLimit = dinoz.skills.some(skill => skill.skillId === Skill.NAPOMAGICIEN) ? 2 : 1;

		if (magicalItemsEquipped >= magicalItemsLimit) {
			throw new ExpectedError(translate('tooManyMagicItemEquiped', authed));
		}
	}

	const playerItem = dinoz.player.items.find(item => item.itemId === itemId)?.quantity ?? 0;

	if (playerItem === 0 && equip) {
		throw new ExpectedError(`You don't have enought ${itemToEquip.itemId}`);
	}

	if (backpackSlot(dinoz.player.engineer, dinoz) <= dinoz.items.length && equip) {
		throw new ExpectedError(translate(`backpackFull`, authed));
	}

	const dinozItem = dinoz.items.find(item => item.itemId === itemId);

	if (!dinozItem && !equip) {
		throw new ExpectedError(`This dinoz don't have this item equiped`);
	}

	if (equip) {
		await decreaseItemQuantity(dinoz.player.id, itemToEquip.itemId, 1);
		dinoz.items.push(await addItemToDinoz(dinoz.id, itemToEquip.itemId));
	} else {
		if (!dinozItem) throw new ExpectedError(`This dinoz doesn't have this item equiped`);

		if (playerItem >= (dinoz.player.shopKeeper ? Math.round(itemToEquip.maxQuantity * 1.5) : itemToEquip.maxQuantity))
			throw new ExpectedError(translate('maxQuantityInventory', authed));
		await removeItemFromDinoz(dinoz.id, dinozItem.itemId);
		await increaseItemQuantity(dinoz.player.id, itemToEquip.itemId, 1);
		const itemIndex = dinoz.items.findIndex(item => item.id === dinozItem.id);
		dinoz.items.splice(itemIndex, 1);
	}
	return dinoz.items.map(item => {
		return { itemId: item.itemId };
	});
}

export const heal = (dinoz: Pick<Dinoz, 'id' | 'life' | 'maxLife'>, lifeToAdd: number) => {
	const lifeMissing = dinoz.maxLife - dinoz.life; // Calculer la quantité de points de vie manquants
	const lifeHealed = Math.min(lifeToAdd, lifeMissing); // Utiliser le plus petit des deux nombres
	if (lifeHealed === 0) throw new ExpectedError('AlreadyAtMaxHealth');
	if (dinoz.life === 0) throw new ExpectedError('DinozIsDead');
	dinoz.life += Math.round(lifeHealed);
	return {
		id: dinoz.id,
		life: dinoz.life
	};
};

export const resurrect = (dinoz: Pick<Dinoz, 'life' | 'id'>) => {
	if (dinoz.life > 0) {
		throw new ExpectedError('DinozNotDead');
	}
	dinoz.life = 1;
	return {
		id: dinoz.id,
		life: dinoz.life
	};
};
