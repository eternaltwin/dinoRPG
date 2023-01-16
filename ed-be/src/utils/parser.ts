import { unlockDoubleSkills } from '../business/skillService.js';
import { levelList } from '../constants/level.js';
import { skillList } from '../constants/skill.js';
import { statusList } from '../constants/status.js';
import { addExperience, setDinozNextElement } from '../dao/dinozDao.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { addStatusToDinoz, removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { Dinoz } from '../entity/dinoz.js';
import { DinozSkill, Player, PlayerItem } from '../entity/index.js';
import { ConditionEnum, RewardEnum, TriggerEnum } from '../models/enums/Parser.js';
import { missionsList } from '../constants/missions.js';
import { itemList, placeList } from '../constants/index.js';
import { ItemFiche, Place } from '../models/index.js';
import { addPlayerMoney, getPlayerShopOneItemDataRequest } from '../dao/playerDao.js';
import { createItemDataRequest, changeItemQuantity, updateItemDataRequest } from '../dao/playerItemDao.js';

function checkCondition(condition: string, dinoz: Dinoz): boolean {
	const conditionList: Array<string> = condition.split('+');
	let conditionResult: boolean = true;

	conditionList.forEach(condition => {
		let orConditionResult: boolean | undefined = undefined;
		if (condition.includes('|')) {
			condition
				.split('|')
				.forEach(orCondition => (orConditionResult = orConditionResult || conditionParser(orCondition, dinoz)));
		} else {
			conditionResult = conditionParser(condition, dinoz) && conditionResult;
		}
		conditionResult = conditionResult && (orConditionResult ?? true);
	});
	return conditionResult;
}

function conditionParser(condition: string, dinoz: Dinoz): boolean {
	const param: string = condition.substring(condition.indexOf('(') + 1, condition.indexOf(')'));
	let result: boolean | undefined = undefined;
	if (condition.includes(ConditionEnum.LEVEL)) {
		result = dinoz.level >= parseInt(param);
	} else if (condition.includes(ConditionEnum.STATUS)) {
		let status = Object.entries(statusList).find(status => status[0] === param.toUpperCase()) as [string, number];
		result = dinoz.status.some(dinozStatus => dinozStatus.statusId === status[1]);
	} else if (condition.includes(ConditionEnum.SCENARIO)) {
	} else if (condition.includes(ConditionEnum.CURRENT_MISSION)) {
		//Avoir la mission en cours
	} else if (condition.includes(ConditionEnum.FINISHED_MISSION)) {
		let mission = Object.entries(missionsList).find(mission => mission[0] === param.toUpperCase()) as [string, number];
		result = dinoz.missions.find(missions => missions.missionId === mission[1])?.isFinished;
	} else if (condition.includes(ConditionEnum.POSSESS_INGREDIENT)) {
	} else if (condition.includes(ConditionEnum.POSSESS_OBJECT)) {
	} else if (condition.includes(ConditionEnum.ACTIVE)) {
	} else if (condition.includes(ConditionEnum.PLAYER_EPIC)) {
		//Récompense epic du joueur
	} else if (condition.includes(ConditionEnum.RANDOM)) {
		//Random
	} else if (condition.includes(ConditionEnum.HOUR_RAND)) {
		//Random sur l'heure
	} else if (condition.includes(ConditionEnum.TAG)) {
		// ??
	} else if (condition.includes(ConditionEnum.COLLEC)) {
	} else if (condition.includes(ConditionEnum.GVAR)) {
	} else if (condition.includes(ConditionEnum.EVENT)) {
	} else if (condition.includes(ConditionEnum.CLANACT)) {
	} else if (condition.includes(ConditionEnum.SWAIT)) {
	} else if (condition.includes(ConditionEnum.RACE)) {
	} else if (condition.includes(ConditionEnum.SKILL)) {
		let skill = parseInt(param);
		result = dinoz.skills.some(DinozSkill => DinozSkill.skillId === skill);
	} else if (condition.includes(ConditionEnum.EQUIP)) {
	} else if (condition.includes(ConditionEnum.UTIME)) {
	} else if (condition.includes(ConditionEnum.GOTO)) {
		let place = Object.entries(placeList).find(place => place[0].toUpperCase() === param.toUpperCase()) as [
			string,
			Place
		];
		result = place[1].placeId === dinoz.placeId;
	}
	if (condition.startsWith('!')) {
		result = !result;
	}
	return result!;
}

async function triggerAction(action: string, dinoz: Dinoz): Promise<boolean> {
	let result: boolean;
	if (action.includes(TriggerEnum.FIGHT)) {
		//Launch the fight against param
		result = true;
	} else {
		result = false;
	}
	return result;

	// if (reward != undefined && result) {
	// 	await rewarder(reward, dinoz);
	// }
}

async function rewarder(rewards: Array<string>, dinoz: Dinoz): Promise<void> {
	for (const reward of rewards) {
		const param: string = reward.substring(reward.indexOf('(') + 1, reward.indexOf(')'));
		const action: string = reward.split('(')[0];
		if (action === RewardEnum.STATUS) {
			const statusId: number = Object.entries(statusList).find(status => status[0] === param.toUpperCase())![1];
			if (reward.startsWith('!')) {
				await removeStatusToDinoz(dinoz.id, statusId);
			} else {
				await addStatusToDinoz(dinoz, statusId);
			}
		} else if (action === RewardEnum.CHANGE_ELEMENT) {
			let elementId: number;
			switch (param) {
				case 'fire':
					elementId = 1;
					break;
				case 'wood':
					elementId = 2;
					break;
				case 'water':
					elementId = 3;
					break;
				case 'lightning':
					elementId = 4;
					break;
				case 'air':
					elementId = 5;
					break;
				default:
					elementId = 1;
			}
			await setDinozNextElement(dinoz.id, elementId);
		} else if (action === RewardEnum.MAXEXPERIENCE) {
			const maxExp: number = levelList.find(level => level.id === dinoz.level)!.experience;
			await addExperience(dinoz.id, maxExp - dinoz.experience);
		} else if (action === RewardEnum.SKILL) {
			await addSkillToDinoz(new DinozSkill(new Dinoz(dinoz.id), parseInt(param)));

			if (parseInt(param) === skillList.COMPETENCE_DOUBLE.skillId) {
				await unlockDoubleSkills(dinoz.id);
			}
		} else if (action === RewardEnum.EXPERIENCE) {
			await addExperience(dinoz.id, parseInt(param));
		} else if (action === RewardEnum.GOLD) {
			await addPlayerMoney(dinoz.player.id, parseInt(param));
		} else if (action === RewardEnum.ITEM) {
			const paramItem: string = param.split(',')[0];
			const paramQuantity: number = parseInt(param.split(',')[1]);
			const itemRewarded = Object.entries(itemList).find(item => item[0] === paramItem)![1];
			const playerShopData: Player = await getPlayerShopOneItemDataRequest(dinoz.player.id, itemRewarded.itemId);
			const playerItemData: PlayerItem | undefined = playerShopData.items.find(
				item => item.itemId === itemRewarded.itemId
			);
			if (playerItemData) {
				await changeItemQuantity(dinoz.player.id, itemRewarded.itemId, paramQuantity);
			} else {
				const newItem = new PlayerItem();
				newItem.player = playerShopData;
				newItem.itemId = itemRewarded.itemId!;
				newItem.quantity = paramQuantity;
				await createItemDataRequest(newItem);
			}
		} else {
			console.log('Not implemented yet');
		}
	}
}

export { checkCondition, conditionParser, triggerAction, rewarder };
