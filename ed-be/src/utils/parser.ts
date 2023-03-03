import { unlockDoubleSkills } from '../business/skillService.js';
import { levelList } from '../constants/level.js';
import { skillList } from '../constants/skill.js';
import { statusList } from '../constants/status.js';
import { addExperience, setDinozNextElement } from '../dao/dinozDao.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { addStatusToDinoz, removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { Dinoz } from '../entity/dinoz.js';
import { DinozSkill, Player, PlayerItem, PlayerReward } from '../entity/index.js';
import {
	Condition,
	ConditionEnum,
	ConditionOperatorEnum,
	Place,
	RewardEnum,
	Rewarder,
	TriggerEnum
} from '../models/index.js';
import { missionsList } from '../constants/missions.js';
import { itemList, placeList, rewardList } from '../constants/index.js';
import { addPlayerMoney, getPlayerRewardsRequest, getPlayerShopOneItemDataRequest } from '../dao/playerDao.js';
import { changeItemQuantity, createItemDataRequest } from '../dao/playerItemDao.js';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';

function checkCondition(condition: Condition, dinoz: Dinoz): boolean {
	let conditionResult: boolean = true;

	if (condition.nextCondition && condition.operator === ConditionOperatorEnum.AND) {
		conditionResult = conditionResult && checkCondition(condition.nextCondition, dinoz);
	} else if (condition.nextCondition && condition.operator === ConditionOperatorEnum.OR) {
		conditionResult = conditionResult || checkCondition(condition.nextCondition, dinoz);
	}
	return conditionResult && conditionParser(condition, dinoz);
}

function conditionParser(condition: Condition, dinoz: Dinoz): boolean {
	let result: boolean | undefined = undefined;
	switch (condition.conditionType) {
		case ConditionEnum.MINLEVEL:
			result = dinoz.level >= condition.value;
			break;
		case ConditionEnum.MAXLEVEL:
			result = dinoz.level < condition.value;
			break;
		case ConditionEnum.STATUS:
			let status = Object.entries(statusList).find(status => status[0] === condition.value.toUpperCase()) as [
				string,
				number
			];
			result = dinoz.status.some(dinozStatus => dinozStatus.statusId === status[1]);
			break;
		case ConditionEnum.FINISHED_MISSION:
			let mission = Object.entries(missionsList).find(mission => mission[0] === condition.value.toUpperCase()) as [
				string,
				number
			];
			result = dinoz.missions.find(missions => missions.missionId === mission[1])?.isFinished;
			break;
		case ConditionEnum.SKILL:
			result = dinoz.skills.some(DinozSkill => DinozSkill.skillId === condition.value);
			break;
		case ConditionEnum.GOTO:
			let place = Object.entries(placeList).find(place => place[0].toUpperCase() === condition.value.toUpperCase()) as [
				string,
				Place
			];
			result = place[1].placeId === dinoz.placeId;
			break;
		default:
			break;
	}

	if (condition.reverse) {
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

async function rewarder(rewards: Array<Rewarder>, dinoz: Dinoz): Promise<void> {
	for (const reward of rewards) {
		if (reward.rewardType === RewardEnum.STATUS) {
			const statusId: number = Object.entries(statusList).find(status => status[0] === reward.value!.toUpperCase())![1];
			if (reward.reverse) {
				await removeStatusToDinoz(dinoz.id, statusId);
			} else {
				await addStatusToDinoz(dinoz, statusId);
			}
		} else if (reward.rewardType === RewardEnum.CHANGE_ELEMENT) {
			await setDinozNextElement(dinoz.id, reward.value);
		} else if (reward.rewardType === RewardEnum.MAXEXPERIENCE) {
			const maxExp: number = levelList.find(level => level.id === dinoz.level)!.experience;
			await addExperience(dinoz.id, maxExp - dinoz.experience);
		} else if (reward.rewardType === RewardEnum.SKILL) {
			await addSkillToDinoz(new DinozSkill(new Dinoz(dinoz.id), reward.value));

			if (reward.value === skillList.COMPETENCE_DOUBLE.skillId) {
				await unlockDoubleSkills(dinoz.id);
			}
		} else if (reward.rewardType === RewardEnum.EXPERIENCE) {
			await addExperience(dinoz.id, reward.value);
		} else if (reward.rewardType === RewardEnum.GOLD) {
			await addPlayerMoney(dinoz.player.id, reward.value);
		} else if (reward.rewardType === RewardEnum.ITEM) {
			const itemRewarded = Object.entries(itemList).find(item => item[0] === reward.value)![1];
			const playerShopData: Player = await getPlayerShopOneItemDataRequest(dinoz.player.id, itemRewarded.itemId);
			const playerItemData: PlayerItem | undefined = playerShopData.items.find(
				item => item.itemId === itemRewarded.itemId
			);
			if (playerItemData) {
				await changeItemQuantity(dinoz.player.id, itemRewarded.itemId, reward.quantity);
			} else {
				const newItem = new PlayerItem();
				newItem.player = playerShopData;
				newItem.itemId = itemRewarded.itemId!;
				newItem.quantity = reward.quantity;
				await createItemDataRequest(newItem);
			}
		} else if (reward.rewardType === RewardEnum.EPIC) {
			const testRewards = await getPlayerRewardsRequest(dinoz.player.id);
			const epic = Object.entries(rewardList).find(item => item[0] === reward.value)![1];
			const EpicReward = new PlayerReward(new Player(dinoz.player.id), epic);
			if (!testRewards.rewards.some(r => r.rewardId === epic)) {
				await addRewardToPlayer(EpicReward);
			}
		} else {
			console.log('Not implemented yet');
		}
	}
}

export { checkCondition, conditionParser, triggerAction, rewarder };
