import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { Reward } from '../../reward/RewardList.mjs';

export const PTEROZ: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['fight', 'leave'],
		initialStep: true
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [bossList.PTEROZ],
		condition: {
			[Operator.AND]: [{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.PTEROZ } }, { [ConditionEnum.MINLEVEL]: 8 }]
		},
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.PTEROZ
			}
		]
	},
	leave: {
		stepName: 'leave',
		nextStep: []
	},
	fight_win: {
		stepName: 'fight_win',
		nextStep: []
	}
};

export const HIPPO: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['fight', 'leave'],
		initialStep: true
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [bossList.HIPPOCLAMP],
		condition: {
			[Operator.AND]: [{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.HIPPO } }, { [ConditionEnum.MINLEVEL]: 8 }]
		},
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.HIPPO
			}
		]
	},
	leave: {
		stepName: 'leave',
		nextStep: []
	},
	fight_win: {
		stepName: 'fight_win',
		nextStep: []
	}
};

export const ROCKY: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['fight', 'leave', 'touch', 'grave'],
		initialStep: true
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [bossList.ROCKY],
		condition: {
			[Operator.AND]: [{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.ROCKY } }, { [ConditionEnum.MINLEVEL]: 13 }]
		},
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.ROCKY
			}
		]
	},
	leave: {
		stepName: 'leave',
		nextStep: []
	},
	touch: {
		stepName: 'touch',
		nextStep: []
	},
	grave: {
		stepName: 'grave',
		nextStep: [],
		redirect: 'fight'
	},
	fight_win: {
		stepName: 'fight_win',
		nextStep: []
	}
};
