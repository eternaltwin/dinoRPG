import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { Dinoz, DinozSkill, Player, PlayerItem, PlayerReward } from '../entity/index.js';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { itemList, levelList, rewardList, skillList, statusList } from '../constants/index.js';
import { addStatusToDinoz, removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { addExperience, setDinozNextElement } from '../dao/dinozDao.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { unlockDoubleSkills } from '../business/skillService.js';
import { addPlayerMoney, getPlayerRewardsRequest, getPlayerShopOneItemDataRequest } from '../dao/playerDao.js';
import { changeItemQuantity, createItemDataRequest } from '../dao/playerItemDao.js';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { item } from '../test/utils/constants.js';

export async function rewarder(rewards: Array<Rewarder>, dinoz: Dinoz): Promise<void> {
	for (const reward of rewards) {
		if (reward.rewardType === RewardEnum.STATUS) {
			if (reward.reverse) {
				await removeStatusToDinoz(dinoz.id, reward.value);
			} else {
				await addStatusToDinoz(dinoz, reward.value);
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
			const itemRewarded = Object.values(itemList).find(item => item.itemId === reward.value)!;
			const playerShopData: Player = await getPlayerShopOneItemDataRequest(dinoz.player.id, itemRewarded.itemId);
			const playerItemData: PlayerItem | undefined = playerShopData.items.find(
				item => item.itemId === itemRewarded.itemId
			);
			if (playerItemData) {
				await changeItemQuantity(
					dinoz.player.id,
					itemRewarded.itemId,
					itemRewarded.maxQuantity - playerItemData!.quantity >= reward.quantity
						? reward.quantity
						: itemRewarded.maxQuantity - playerItemData!.quantity
				);
			} else {
				await createItemDataRequest(new PlayerItem(playerShopData, itemRewarded.itemId!, reward.quantity));
			}
		} else if (reward.rewardType === RewardEnum.EPIC) {
			const testRewards = await getPlayerRewardsRequest(dinoz.player.id);
			const epic = Object.entries(rewardList).find(item => item[0] === reward.value)![1];
			const EpicReward = new PlayerReward(new Player(dinoz.player.id), epic);
			if (!testRewards.rewards.some(r => r.rewardId === epic)) {
				await addRewardToPlayer(EpicReward);
			}
		} else if (reward.rewardType === RewardEnum.SCENARIO) {
			//TODO: Implement scenario
			console.log('Not implemented yet');
		} else {
			console.log('Not implemented yet');
		}
	}
}
