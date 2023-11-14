import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, Operator, RewardEnum } from "../../enums/Parser.mjs";
import { rewardList } from "../../reward/RewardList.mjs";
import { NpcData } from "../NpcData.mjs";

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
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.NENUPHAR_LEAF } },
				{ [Operator.NOT]: { [ConditionEnum.COLLEC]: rewardList.PERLE } }
			],
		},
		nextStep: ['get']
	},
	give: {
		stepName: 'give',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: statusList.NENUPHAR_LEAF },
				{ [Operator.NOT]: { [ConditionEnum.COLLEC]: rewardList.PERLE } }
			],
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
			[ConditionEnum.COLLEC]: rewardList.PERLE
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
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: statusList.ZORS_GLOVE },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.NENUPHAR_LEAF } }
			],
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
