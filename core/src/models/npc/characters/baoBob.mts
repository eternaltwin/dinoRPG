import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, Operator, RewardEnum } from "../../enums/Parser.mjs";
import { ServiceEnum } from "../../enums/ServiceEnum.mjs";
import { NpcData } from "../NpcData.mjs";

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
			[Operator.NOT]: { [ConditionEnum.STATUS]: statusList.FLIPPERS },
		},
		nextStep: []
	},
	quest3: {
		stepName: 'quest3',
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.SYLVENOIRE_KEY } },
				{ [ConditionEnum.STATUS]: statusList.FLIPPERS },
			],
		},
		nextStep: ['where2', 'how', 'danger', 'bye']
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
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.CONCENTRATION, ServiceEnum.REFRESH_DINOZLIST]
			}
		],
		nextStep: []
	},
	quest4: {
		stepName: 'quest4',
		nextStep: ['noingr', 'ingr', 'bye'],
		condition: {
			[ConditionEnum.SCENARIO]: ['magnet', 8],
		}
	},
	noingr: {
		stepName: 'noingr',
		nextStep: [],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: statusList.FLOWERING_BRANCH },
				{ [ConditionEnum.STATUS]: statusList.ICE_PIECE },
				{ [ConditionEnum.STATUS]: statusList.CORAIL },
			],
		}
	},
	ingr: {
		stepName: 'ingr',
		nextStep: ['potion'],
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.FLOWERING_BRANCH } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.ICE_PIECE } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.CORAIL } },
			],
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.FLOWERING_BRANCH,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ICE_PIECE,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.CORAIL,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ANTI_SEDH_POTION
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
