import { ConditionEnum, RewardEnum } from "../../enums/Parser.mjs";
import { NpcData } from "../NpcData.mjs";

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
			conditionType: ConditionEnum.SKILL,
			value: 61119,
			reverse: true
		},
		target: 'dolearn'
	},
	learn1: {
		stepName: 'learn1',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 11305,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 41303
			}
		},
		target: 'dolearn'
	},
	learn1bis: {
		stepName: 'learn1bis',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 11310,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 51306
			}
		},
		target: 'dolearn'
	},
	learn2: {
		stepName: 'learn2',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 11308,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 21303
			}
		},
		target: 'dolearn'
	},
	learn2bis: {
		stepName: 'learn2bis',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 11311,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 31301
			}
		},
		target: 'dolearn'
	},
	learn3: {
		stepName: 'learn3',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 21301,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 41306
			}
		},
		target: 'dolearn'
	},
	learn3bis: {
		stepName: 'learn3bis',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 31304,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 513012
			}
		},
		target: 'dolearn'
	},
	learn4: {
		stepName: 'learn4',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 31311,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 21309
			}
		},
		target: 'dolearn'
	},
	learn4bis: {
		stepName: 'learn4bis',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 51302,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 41305
			}
		},
		target: 'dolearn'
	},
	learn5: {
		stepName: 'learn5',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 413031,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 31308
			}
		},
		target: 'dolearn'
	},
	learn5bis: {
		stepName: 'learn5bis',
		nextStep: ['dolearn'],
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: 51310,
			nextCondition: {
				conditionType: ConditionEnum.SKILL,
				value: 21304
			}
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
			conditionType: ConditionEnum.SKILL,
			value: 61119
		}
	},
	missions: {
		stepName: 'missions',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
