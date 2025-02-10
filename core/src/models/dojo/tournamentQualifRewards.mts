import { Rewarder } from '../reward/Rewarder.mjs';
import { RewardEnum } from '../enums/Parser.mjs';
import { Item } from '../item/ItemList.mjs';

export const tournamentQualifRewards: QualifReward[] = [
	{
		floor: 1400,
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 50000
			},
			{
				rewardType: RewardEnum.ITEM,
				value: Item.SOUFFLET_EGG,
				quantity: 1
			},
			{
				rewardType: RewardEnum.ITEM,
				value: Item.BOX_LEGENDARY,
				quantity: 1
			}
		]
	},
	{
		floor: 1300,
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: Item.GOLDEN_NAPODINO,
				quantity: 1
			}
		]
	},
	{
		floor: 1200,
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 20000
			},
			{
				rewardType: RewardEnum.ITEM,
				value: Item.TOUFUFU_BABY_RARE,
				quantity: 1
			},
			{
				rewardType: RewardEnum.ITEM,
				value: Item.BOX_LEGENDARY,
				quantity: 1
			}
		]
	},
	{
		floor: 1000,
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 10000
			},
			{
				rewardType: RewardEnum.ITEM,
				value: Item.TOUFUFU_BABY,
				quantity: 1
			},
			{
				rewardType: RewardEnum.ITEM,
				value: Item.BOX_EPIC,
				quantity: 1
			}
		]
	},
	{
		floor: 750,
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 5000
			},
			{
				rewardType: RewardEnum.ITEM,
				value: Item.VOID_SPHERE,
				quantity: 1
			}
		]
	}
];

export type QualifReward = {
	floor: number;
	rewards: Rewarder[];
};
