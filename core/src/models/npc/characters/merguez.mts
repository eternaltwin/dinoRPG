import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { Item, itemList } from '../../item/ItemList.mjs';
import { NpcData } from '../NpcData.mjs';

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
		nextStep: ['ah'],
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
				quantity: 5
			}
		],
		nextStep: ['thanks']
	},
	thanks: {
		stepName: 'thanks',
		nextStep: []
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
