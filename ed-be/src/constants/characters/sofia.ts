import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { statusList } from '../status.js';

export const SOFIA: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['slurp'],
		initialStep: true
	},
	slurp: {
		stepName: 'slurp',
		nextStep: ['troph', 'nouvelle', 'niveau', 'ether']
	},
	nouvelle: {
		stepName: 'nouvelle',
		nextStep: ['bien']
	},
	bien: {
		stepName: 'bien',
		nextStep: []
	},
	troph: {
		stepName: 'troph',
		nextStep: ['palais']
	},
	palais: {
		stepName: 'palais',
		nextStep: ['retour']
	},
	retour: {
		stepName: 'retour',
		nextStep: []
	},
	niveau: {
		stepName: 'niveau',
		nextStep: ['yes', 'no'],
		condition: {
			conditionType: ConditionEnum.MINLEVEL,
			value: 50,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.BROKEN_LIMIT_1,
				reverse: true
			}
		}
	},
	yes: {
		stepName: 'yes',
		nextStep: ['ether'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.BROKEN_LIMIT_1
			}
		]
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	ether: {
		stepName: 'ether',
		nextStep: ['newskill', 'no2'],
		condition: {
			conditionType: ConditionEnum.MINLEVEL,
			value: 50,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.BROKEN_LIMIT_1,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: statusList.ETHER_DROP,
					reverse: true
				}
			}
		}
	},
	newskill: {
		stepName: 'newskill',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ETHER_DROP
			}
		]
	},
	no2: {
		stepName: 'no2',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
