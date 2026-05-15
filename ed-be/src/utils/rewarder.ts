import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { addStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { unlockDoubleSkills } from '../business/skillService.js';
import { addMoney, getPlayerRewardsRequest, getPlayerShopOneItemDataRequest } from '../dao/playerDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { levelList } from '@drpg/core/models/dinoz/DinozLevel';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { Dinoz, DinozStatus, LogType, NotificationSeverity, PantheonMotif } from '@drpg/prisma';
import { updateDinoz } from '../dao/dinozDao.js';
import { createLog } from '../dao/logDao.js';
import { upsertQuest } from '../dao/questsDao.js';
import { checkAnnounce } from './announcer.js';
import { createNotification } from '../dao/notificationDao.js';
import { LOGGER } from '../context.js';
import { Reward, rewardList } from '@drpg/core/models/reward/RewardList';
import { getItemMaxQuantity } from '../business/inventoryService.js';

export type RewarderPromise = ReturnType<typeof rewarder>;
export async function rewarder(
	rewards: Rewarder[],
	team: (Pick<Dinoz, 'id' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	})[],
	playerId: string,
	notify?: boolean
): Promise<[Item, number][]> {
	if (!team.length) {
		throw new ExpectedError('No player found');
	}

	let actualRewards: [Item, number][] = [];

	for (const dinoz of team) {
		for (const reward of rewards) {
			let showNotification = notify ?? true;

			switch (reward.rewardType) {
				case RewardEnum.STATUS:
					if (reward.reverse) {
						await removeStatusFromDinoz(dinoz.id, reward.value);
					} else {
						if (dinoz.status.some(status => status.statusId === reward.value)) break;
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
					if (showNotification) {
						await createNotification(playerId, JSON.stringify([reward]), NotificationSeverity.reward);
					}
					break;
				case RewardEnum.MAX_ITEM:
					const itemRef = Object.values(itemList).find(item => item.itemId === reward.value);
					if (!itemRef) {
						throw new ExpectedError(`Item ${reward.value} doesn't exist.`);
					}

					const playerData = await getPlayerShopOneItemDataRequest(playerId, itemRef.itemId);
					const playerItemToMaxData = playerData.items.find(item => item.itemId === itemRef.itemId);
					const maxQuantity = getItemMaxQuantity(playerData, itemRef);
					if (playerItemToMaxData) {
						if (playerItemToMaxData.quantity >= maxQuantity) break;

						const actualQuantity = maxQuantity - playerItemToMaxData.quantity;

						await increaseItemQuantity(playerId, itemRef.itemId, actualQuantity);
						actualRewards.push([itemRef.itemId, actualQuantity]);
					} else {
						await insertItem(playerId, { itemId: itemRef.itemId, quantity: maxQuantity });
						actualRewards.push([itemRef.itemId, maxQuantity]);
					}
					break;
				case RewardEnum.ITEM:
					const itemRewarded = Object.values(itemList).find(item => item.itemId === reward.value);
					if (!itemRewarded) {
						throw new ExpectedError(`Item ${reward.value} doesn't exist.`);
					}

					showNotification = reward.notify ?? true;

					const playerShopData = await getPlayerShopOneItemDataRequest(playerId, itemRewarded.itemId);
					const playerItemData = playerShopData.items.find(item => item.itemId === itemRewarded.itemId);
					if (playerItemData) {
						if (reward.reverse) {
							await decreaseItemQuantity(playerId, itemRewarded.itemId, reward.quantity);
						} else {
							const maxQuantity = getItemMaxQuantity(playerShopData, itemRewarded);

							if (playerItemData.quantity >= maxQuantity) break;

							const actualQuantity = Math.min(maxQuantity - playerItemData.quantity, reward.quantity);
							await increaseItemQuantity(playerId, itemRewarded.itemId, actualQuantity);
							actualRewards.push([itemRewarded.itemId, actualQuantity]);
						}
					} else {
						await insertItem(playerId, { itemId: itemRewarded.itemId, quantity: reward.quantity });
						actualRewards.push([itemRewarded.itemId, reward.quantity]);
					}
					if (showNotification) {
						await createNotification(playerId, JSON.stringify([reward]), NotificationSeverity.reward);
					}
					break;
				case RewardEnum.EPIC:
					const playerRewards = await getPlayerRewardsRequest(playerId);
					if (!playerRewards) {
						throw new ExpectedError(`Player ${playerId} doesn't exist.`);
					}
					const rewardDetails = rewardList[reward.value as Reward];
					if (!rewardDetails) {
						throw new ExpectedError(`Reward ${reward.value} doesn't exist.`);
					}
					if (!playerRewards.rewards.some(r => r.rewardId === rewardDetails.id)) {
						await addRewardToPlayer({
							rewardId: reward.value,
							player: { connect: { id: playerId } }
						});
						await checkAnnounce(PantheonMotif.epic, playerId, reward.value);
						if (showNotification && rewardDetails.announced) {
							await createNotification(playerId, JSON.stringify([reward]), NotificationSeverity.reward);
						}
					}
					break;
				case RewardEnum.SCENARIO:
					await upsertQuest(playerId, reward.value, reward.step);
					await createNotification(playerId, JSON.stringify([reward]), NotificationSeverity.scenario);
					break;
				case RewardEnum.TELEPORT:
					await updateDinoz(dinoz.id, { placeId: reward.place.placeId });
					break;
				case RewardEnum.REDIRECT:
					// Nothing to do here
					break;
				default:
					LOGGER.log(`Reward not yet implemented.`);
					break;
			}
		}
	}

	return actualRewards;
}
