import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

export const MMEX: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		nextStep: ['talk2']
	},
	talk2: {
		stepName: 'talk2',
		nextStep: ['question', 'missions']
	},
	question: {
		stepName: 'question',
		nextStep: ['question2']
	},
	question2: {
		stepName: 'question2',
		nextStep: ['double']
	},
	double: {
		stepName: 'double',
		nextStep: ['double2']
	},
	double2: {
		stepName: 'double2',
		nextStep: ['double3']
	},
	double3: {
		stepName: 'double3',
		nextStep: ['learn', 'already']
	},
	learn: {
		stepName: 'learn',
		nextStep: ['learn1', 'learn2', 'learn3', 'learn4', 'learn5', 'no'],
		condition: {
			[Operator.NOT]: { [ConditionEnum.SKILL]: 61119 }
		},
		target: 'dolearn'
	},
	learn1: {
		stepName: 'learn1',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 11305 }, { [ConditionEnum.SKILL]: 41303 }]
		},
		target: 'dolearn'
	},
	learn1bis: {
		stepName: 'learn1bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 11310 }, { [ConditionEnum.SKILL]: 51306 }]
		},
		target: 'dolearn'
	},
	learn2: {
		stepName: 'learn2',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 11308 }, { [ConditionEnum.SKILL]: 21303 }]
		},
		target: 'dolearn'
	},
	learn2bis: {
		stepName: 'learn2bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 11311 }, { [ConditionEnum.SKILL]: 31301 }]
		},
		target: 'dolearn'
	},
	learn3: {
		stepName: 'learn3',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 21301 }, { [ConditionEnum.SKILL]: 41306 }]
		},
		target: 'dolearn'
	},
	learn3bis: {
		stepName: 'learn3bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 31304 }, { [ConditionEnum.SKILL]: 51312 }]
		},
		target: 'dolearn'
	},
	learn4: {
		stepName: 'learn4',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 31311 }, { [ConditionEnum.SKILL]: 21309 }]
		},
		target: 'dolearn'
	},
	learn4bis: {
		stepName: 'learn4bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 51302 }, { [ConditionEnum.SKILL]: 41305 }]
		},
		target: 'dolearn'
	},
	learn5: {
		stepName: 'learn5',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 41301 }, { [ConditionEnum.SKILL]: 31308 }]
		},
		target: 'dolearn'
	},
	learn5bis: {
		stepName: 'learn5bis',
		nextStep: ['dolearn'],
		condition: {
			[Operator.AND]: [{ [ConditionEnum.SKILL]: 51310 }, { [ConditionEnum.SKILL]: 21304 }]
		},
		target: 'dolearn'
	},
	dolearn: {
		stepName: 'dolearn',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.SKILL,
				value: 61119
			}
		]
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	already: {
		stepName: 'already',
		nextStep: [],
		condition: {
			[ConditionEnum.SKILL]: 61119
		}
	},
	missions: {
		stepName: 'missions',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
