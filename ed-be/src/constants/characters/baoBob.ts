import { ConditionEnum, ConditionOperatorEnum, NpcData, RewardEnum } from '../../models/index.js';

export const BAOBOB: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['question', 'nothing'],
		initialStep: true
	},
	question: {
		stepName: 'question',
		nextStep: ['missions', 'quest2', 'quest3', 'quest4', 'no']
	},
	nothing: {
		stepName: 'nothing',
		nextStep: []
	},
	missions: {
		stepName: 'missions',
		nextStep: []
	},
	no: {
		stepName: 'no',
		nextStep: [],
		alias: 'nothing',
		target: 'nothing'
	},
	quest2: {
		stepName: 'quest2',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'FLIPPERS',
			reverse: true
		},
		nextStep: []
	},
	quest3: {
		stepName: 'quest3',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'SYLVENOIRE_KEY',
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'FLIPPERS'
			}
		},
		nextStep: ['where2', 'how', 'quest3', 'danger', 'bye']
	},
	where2: {
		stepName: 'where2',
		nextStep: ['how', 'danger', 'bye']
	},
	how: {
		stepName: 'how',
		nextStep: ['where2', 'danger', 'concen', 'bye']
	},
	danger: {
		stepName: 'danger',
		nextStep: ['where2', 'how', 'bye']
	},
	concen: {
		stepName: 'concen',
		nextStep: ['ok', 'bye']
	},
	ok: {
		stepName: 'ok',
		nextStep: []
	},
	quest4: {
		stepName: 'quest4',
		nextStep: ['noingr', 'ingr', 'bye'],
		condition: {
			conditionType: ConditionEnum.SCENARIO,
			step: 8,
			value: 'magnet'
		}
	},
	noingr: {
		stepName: 'noingr',
		nextStep: [],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'FLOWERING_BRANCH',
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'ICE_PIECE',
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'CORAIL'
				}
			}
		}
	},
	ingr: {
		stepName: 'ingr',
		nextStep: ['potion'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'FLOWERING_BRANCH',
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'ICE_PIECE',
				reverse: true,
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'CORAIL',
					reverse: true
				}
			}
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'FLOWERING_BRANCH',
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: 'ICE_PIECE',
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: 'CORAIL',
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: 'ANTI_SEDH_POTION'
			},
			{
				rewardType: RewardEnum.SCENARIO,
				name: 'magnet',
				step: 9
			}
		]
	},
	potion: {
		stepName: 'potion',
		nextStep: ['potion']
	},
	bye: {
		stepName: 'bye',
		nextStep: [],
		alias: 'nothing'
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
