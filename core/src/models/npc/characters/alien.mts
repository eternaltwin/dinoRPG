import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { Item, itemList } from '../../item/ItemList.mjs';
import { Reward } from '../../reward/RewardList.mjs';
import { NpcData } from '../NpcData.mjs';

export const ALIEN: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		condition: {
			// Initial step triggered if the player is at step 0 of the scenario and the time condition is met
			[Operator.AND]: [{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 0, '='] }, { [ConditionEnum.TIME]: 30 }]
		},
		nextStep: ['yes', 'no'],
		initialStep: true
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	yes: {
		stepName: 'yes',
		nextStep: ['nothing']
	},
	nothing: {
		stepName: 'nothing',
		nextStep: ['dom']
	},
	dom: {
		stepName: 'dom',
		nextStep: ['star']
	},
	star: {
		stepName: 'star',
		nextStep: ['how']
	},
	how: {
		stepName: 'how',
		nextStep: ['ah']
	},
	ah: {
		stepName: 'ah',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.STAR,
				step: 1
			}
		]
	},
	begin_first_star: {
		stepName: 'begin_first_star',
		condition: {
			// Initial step triggers if the player is at step 1 of the scenario
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 1, '=']
		},
		nextStep: ['et'],
		initialStep: true
	},
	et: {
		stepName: 'et',
		nextStep: []
	},
	begin_star: {
		stepName: 'begin_star',
		condition: {
			// Initial step if the player is between step 2 and step 7 of the scenario
			[Operator.AND]: [
				{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 2, '+'] },
				{ [Operator.NOT]: { [ConditionEnum.SCENARIO]: [Scenario.STAR, 8, '+'] } }
			]
		},
		nextStep: ['star2', 'star3', 'star4', 'star5', 'star6', 'star7'],
		initialStep: true
	},
	star2: {
		stepName: 'star2',
		nextStep: ['end'],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 2, '=']
		}
	},
	star3: {
		stepName: 'star3',
		nextStep: ['end'],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 3, '=']
		}
	},
	star4: {
		stepName: 'star4',
		nextStep: ['end'],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 4, '=']
		}
	},
	star5: {
		stepName: 'star5',
		nextStep: ['end'],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 5, '=']
		}
	},
	star6: {
		stepName: 'star6',
		nextStep: ['end'],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 6, '=']
		}
	},
	star7: {
		stepName: 'star7',
		nextStep: ['end'],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 7, '=']
		}
	},
	end: {
		stepName: 'end',
		nextStep: []
	},
	begin_plume: {
		stepName: 'begin_plume',
		condition: {
			// Initial step of the end of the scenario
			[Operator.OR]: [
				{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 8, '='] },
				{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 9, '='] }
			]
		},
		nextStep: ['ok'],
		initialStep: true
	},
	ok: {
		stepName: 'ok',
		nextStep: ['give']
	},
	give: {
		stepName: 'give',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.STAR,
				step: 9
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.MAGIC_STAR].itemId,
				quantity: 7,
				reverse: true
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.GOLDEN_NAPODINO].itemId,
				quantity: 1
			},
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.PLUME
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
