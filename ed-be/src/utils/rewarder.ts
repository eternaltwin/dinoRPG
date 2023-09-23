import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { Dinoz, DinozSkill, Player, PlayerItem, PlayerReward } from '../entity/index.js';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { itemList, levelList, rewardList, skillList } from '../constants/index.js';
import { addStatusToDinoz, removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { addExperience, setDinozNextElement, setDinozPlaceRequest } from '../dao/dinozDao.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { unlockDoubleSkills } from '../business/skillService.js';
import { addPlayerMoney, getPlayerRewardsRequest, getPlayerShopOneItemDataRequest } from '../dao/playerDao.js';
import { changeItemQuantity, createItemDataRequest } from '../dao/playerItemDao.js';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';

export async function rewarder(rewards: Array<Rewarder>, dinoz: Dinoz): Promise<void> {
	for (const reward of rewards) {
		switch (reward.rewardType) {
			case RewardEnum.STATUS:
				if (reward.reverse) {
					await removeStatusToDinoz(dinoz.id, reward.value);
				} else {
					await addStatusToDinoz(dinoz, reward.value);
				}
				break;
			case RewardEnum.CHANGE_ELEMENT:
				await setDinozNextElement(dinoz.id, reward.value);
				break;
			case RewardEnum.MAXEXPERIENCE:
				const maxExp: number = levelList.find(level => level.id === dinoz.level)!.experience;
				await addExperience(dinoz.id, maxExp - dinoz.experience);
				break;
			case RewardEnum.SKILL:
				await addSkillToDinoz(new DinozSkill(new Dinoz(dinoz.id), reward.value));

				if (reward.value === skillList.COMPETENCE_DOUBLE.skillId) {
					await unlockDoubleSkills(dinoz.id);
				}
				break;
			case RewardEnum.EXPERIENCE:
				await addExperience(dinoz.id, reward.value);
				break;
			case RewardEnum.GOLD:
				await addPlayerMoney(dinoz.player.id, reward.value);
				break;
			case RewardEnum.ITEM:
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
				break;
			case RewardEnum.EPIC:
				const testRewards = await getPlayerRewardsRequest(dinoz.player.id);
				const epic = Object.entries(rewardList).find(item => item[0] === reward.value)![1];
				const EpicReward = new PlayerReward(new Player(dinoz.player.id), epic);
				if (!testRewards.rewards.some(r => r.rewardId === epic)) {
					await addRewardToPlayer(EpicReward);
				}
				break;
			case RewardEnum.SCENARIO:
				//TODO: Implement scenario
				console.log('Scenario are not implemented yet');
				break;
			case RewardEnum.TELEPORT:
				await setDinozPlaceRequest(dinoz.id, reward.place.placeId);
				break;
			default:
				console.log('Not implemented yet');
		}
	}
}
