import { ConditionEnum, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { itemList, Item } from '../../item/ItemList.mjs';
import { Reward } from '../../reward/RewardList.mjs';

export const ALIEN_0: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
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
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const ALIEN_1: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['et'],
		initialStep: true
	},
	et: {
		stepName: 'et',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const ALIEN_8: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
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

export const ALIEN_ALL: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
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
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
