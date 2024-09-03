import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { addStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { unlockDoubleSkills } from '../business/skillService.js';
import { addMoney, getPlayerRewardsRequest, getPlayerShopOneItemDataRequest } from '../dao/playerDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { itemList } from '@drpg/core/models/item/ItemList';
import { levelList } from '@drpg/core/models/dinoz/DinozLevel';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { Dinoz, DinozStatus, LogType } from '@drpg/prisma';
import { updateDinoz } from '../dao/dinozDao.js';
import { createLog } from '../dao/logDao.js';
import { createQuest, updateQuest } from '../dao/questsDao.js';

export async function rewarder(
	rewards: Rewarder[],
	team: (Pick<Dinoz, 'id' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	})[],
	playerId: number
) {
	if (!team.length) {
		throw new ExpectedError('No player found');
	}

	for (const dinoz of team) {
		for (const reward of rewards) {
			switch (reward.rewardType) {
				case RewardEnum.STATUS:
					if (reward.reverse) {
						await removeStatusFromDinoz(dinoz.id, reward.value);
					} else {
						if (dinoz.status.some(status => status.statusId === reward.value)) return;
						await addStatusToDinoz(dinoz.id, reward.value);
					}
					break;
				case RewardEnum.CHANGE_ELEMENT:
					await updateDinoz(dinoz.id, { nextUpElementId: reward.value });
					break;
				case RewardEnum.MAXEXPERIENCE:
					const level = levelList.find(level => level.id === dinoz.level);
					if (!level) {
						throw new ExpectedError(`Level ${dinoz.level} doesn't exist.`);
					}
					const maxExp = level.experience;
					await updateDinoz(dinoz.id, { experience: maxExp });
					break;
				case RewardEnum.SKILL:
					await addSkillToDinoz(dinoz.id, reward.value);

					if (reward.value === skillList[Skill.COMPETENCE_DOUBLE].id) {
						await unlockDoubleSkills(dinoz.id);
					}
					break;
				case RewardEnum.EXPERIENCE:
					await updateDinoz(dinoz.id, { experience: { increment: reward.value } });
					await createLog(LogType.XPEarned, playerId, undefined, reward.value);
					break;
				case RewardEnum.GOLD:
					await addMoney(playerId, reward.value);
					break;
				case RewardEnum.ITEM:
					const itemRewarded = Object.values(itemList).find(item => item.itemId === reward.value);
					if (!itemRewarded) {
						throw new ExpectedError(`Item ${reward.value} doesn't exist.`);
					}

					const playerShopData = await getPlayerShopOneItemDataRequest(playerId, itemRewarded.itemId);
					const playerItemData = playerShopData.items.find(item => item.itemId === itemRewarded.itemId);
					if (playerItemData) {
						if (reward.reverse) {
							await decreaseItemQuantity(playerId, itemRewarded.itemId, reward.quantity);
						} else {
							const quantityLimitedByMaxQuantity = (playerShopData.shopKeeper ? Math.round(itemRewarded.maxQuantity * 1.5) : itemRewarded.maxQuantity) - playerItemData.quantity;

							if (quantityLimitedByMaxQuantity <= 0) break;

							await increaseItemQuantity(
								playerId,
								itemRewarded.itemId,
								Math.min(playerItemData.quantity + reward.quantity, (playerShopData.shopKeeper ? Math.round(itemRewarded.maxQuantity * 1.5) : itemRewarded.maxQuantity)) - playerItemData.quantity
							);
						}
					} else {
						await insertItem(playerId, { itemId: itemRewarded.itemId, quantity: reward.quantity });
					}
					break;
				case RewardEnum.EPIC:
					const testRewards = await getPlayerRewardsRequest(playerId);
					if (!testRewards) {
						throw new ExpectedError(`Player ${playerId} doesn't exist.`);
					}
					if (!testRewards.rewards.some(r => r.rewardId === reward.value)) {
						await addRewardToPlayer({
							rewardId: reward.value,
							player: { connect: { id: playerId } }
						});
					}
					break;
				case RewardEnum.SCENARIO:
					if (reward.step === 1) {
						await createQuest(playerId, reward.value);
					} else {
						await updateQuest(playerId, reward.value, reward.step);
					}
					break;
				case RewardEnum.TELEPORT:
					await updateDinoz(dinoz.id, { placeId: reward.place.placeId });
					break;
				default:
					console.log('Not implemented yet', reward.rewardType);
			}
		}
	}
}
