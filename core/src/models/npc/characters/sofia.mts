import { statusList } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

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
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 50 },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.BROKEN_LIMIT_1 } }
			]
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
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 50 },
				{ [ConditionEnum.STATUS]: statusList.BROKEN_LIMIT_1 },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.ETHER_DROP } }
			]
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
