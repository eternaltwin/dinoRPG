import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { Item, itemList } from '../../item/ItemList.mjs';
import { NpcData } from '../NpcData.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { Reward } from '../../reward/RewardList.mjs';

export const MERGUEZ: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		condition: {
			// Initial step if the conditions of the alien scenario are not met
			[Operator.NOT]: {
				[Operator.AND]: [
					{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 2, '='] },
					{ [ConditionEnum.EQUIP]: itemList[Item.CLOUD_BURGER].itemId }
				]
			}
		},
		nextStep: ['ah', 'merguez_step_1', 'merguez_step_2', 'merguez_step_3', 'merguez_step_4', 'merguez_card'],
		initialStep: true
	},
	ah: {
		stepName: 'ah',
		nextStep: ['ok']
	},
	ok: {
		stepName: 'ok',
		reward: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.GOBLIN_MERGUEZ].itemId,
				quantity: 5,
				notify: false
			}
		],
		nextStep: ['thanks']
	},
	thanks: {
		stepName: 'thanks',
		nextStep: ['begin_merguez']
	},
	begin_merguez: {
		stepName: 'begin_merguez',
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.MERGUEZ, 0, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.MERGUEZ,
				step: 1
			}
		],
		nextStep: []
	},
	merguez_step_1: {
		stepName: 'merguez_step_1',
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.MERGUEZ, 1, '=']
		},
		nextStep: []
	},
	merguez_step_2: {
		stepName: 'merguez_step_2',
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.MERGUEZ, 2, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.MERGUEZ,
				step: 3
			}
		],
		nextStep: []
	},
	merguez_step_3: {
		stepName: 'merguez_step_3',
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.MERGUEZ, 3, '=']
		},
		nextStep: []
	},
	merguez_step_4: {
		stepName: 'merguez_step_4',
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.MERGUEZ, 4, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.MERGUEZ,
				step: 5
			},
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.MERGUEZ_CARD
			}
		],
		nextStep: []
	},
	merguez_card: {
		stepName: 'merguez_card',
		condition: {
			[ConditionEnum.PLAYER_EPIC]: Reward.MERGUEZ_CARD
		},
		reward: [
			{
				rewardType: RewardEnum.MAX_ITEM,
				value: Item.GOBLIN_MERGUEZ
			}
		],
		nextStep: ['thanks']
	},
	begin_star: {
		stepName: 'begin_star',
		condition: {
			// Initial step if the player is at step 2 of the alien scenario
			[Operator.AND]: [
				{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 2, '='] },
				{ [ConditionEnum.EQUIP]: itemList[Item.CLOUD_BURGER].itemId }
			]
		},
		nextStep: ['ok_star'],
		initialStep: true
	},
	ok_star: {
		stepName: 'ok_star',
		nextStep: ['star']
	},
	star: {
		stepName: 'star',
		reward: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.MAGIC_STAR].itemId,
				quantity: 1
			},
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.STAR,
				step: 3
			}
		],
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
