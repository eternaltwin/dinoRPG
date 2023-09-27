import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { statusList } from '../status.js';
import { rewardList } from '../reward.js';

export const HYDARGOL: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		nextStep: ['hello', 'help', 'give', 'act']
	},
	hello: {
		stepName: 'hello',
		nextStep: [],
		target: 'talk'
	},
	help: {
		stepName: 'help',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.NENUPHAR_LEAF,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.COLLEC,
				value: rewardList.PERLE,
				reverse: true
			}
		},
		nextStep: ['get']
	},
	give: {
		stepName: 'give',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.NENUPHAR_LEAF,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.COLLEC,
				value: rewardList.PERLE,
				reverse: true
			}
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.NENUPHAR_LEAF,
				reverse: true
			},
			{
				rewardType: RewardEnum.EPIC,
				value: rewardList.PERLE
			}
		],
		nextStep: []
	},
	act: {
		stepName: 'act',
		condition: {
			conditionType: ConditionEnum.COLLEC,
			value: rewardList.PERLE
		},
		nextStep: ['gant']
	},
	get: {
		stepName: 'get',
		nextStep: ['where']
	},
	where: {
		stepName: 'where',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ZENBRO
			}
		]
	},
	gant: {
		stepName: 'gant',
		nextStep: ['why'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.ZORS_GLOVE,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.NENUPHAR_LEAF,
				reverse: true
			}
		}
	},
	ok: {
		stepName: 'ok',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.NENUPHAR_LEAF
			}
		]
	},
	why: {
		stepName: 'why',
		nextStep: ['super'],
		alias: 'no'
	},
	super: {
		stepName: 'super',
		nextStep: ['ok', 'no']
	},
	no: {
		stepName: 'no',
		target: 'why',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
