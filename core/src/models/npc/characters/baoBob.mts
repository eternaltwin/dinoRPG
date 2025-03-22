import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';
import { Item, itemList } from '../../item/ItemList.mjs';
import { NpcData } from '../NpcData.mjs';

export const BAOBOB: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		condition: {
			// Initial step if the conditions of the alien scenario are not met
			[Operator.NOT]: {
				[Operator.AND]: [
					{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 6, '='] },
					{ [Operator.OR]: [{ [ConditionEnum.HOUR]: 5 }, { [ConditionEnum.HOUR]: 6 }, { [ConditionEnum.HOUR]: 7 }] }
				]
			}
		},
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
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.FLIPPERS }
		},
		nextStep: []
	},
	quest3: {
		stepName: 'quest3',
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SYLVENOIRE_KEY } },
				{ [ConditionEnum.STATUS]: DinozStatusId.FLIPPERS },
				{ [ConditionEnum.ACTIVE]: false } //Disable concentration and darkworld
			]
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
			[ConditionEnum.SCENARIO]: [Scenario.MAGNET, 8, '=']
		}
	},
	noingr: {
		stepName: 'noingr',
		nextStep: [],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.FLOWERING_BRANCH },
				{ [ConditionEnum.STATUS]: DinozStatusId.ICE_PIECE },
				{ [ConditionEnum.STATUS]: DinozStatusId.CORAIL }
			]
		}
	},
	ingr: {
		stepName: 'ingr',
		nextStep: ['potion'],
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.FLOWERING_BRANCH } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ICE_PIECE } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.CORAIL } }
			]
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FLOWERING_BRANCH,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.ICE_PIECE,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.CORAIL,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.ANTI_SEDH_POTION
			},
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.MAGNET,
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
	begin_star: {
		stepName: 'begin_star',
		condition: {
			// Initial step if the player is at step 6 of the alien scenario
			[Operator.AND]: [
				{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 6, '='] },
				{ [Operator.OR]: [{ [ConditionEnum.HOUR]: 5 }, { [ConditionEnum.HOUR]: 6 }, { [ConditionEnum.HOUR]: 7 }] }
			]
		},
		nextStep: ['ok_star'],
		initialStep: true
	},
	ok_star: {
		stepName: 'ok_star',
		nextStep: ['star']
	},
	star: {
		stepName: 'star',
		reward: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.MAGIC_STAR].itemId,
				quantity: 1
			},
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.STAR,
				step: 7
			}
		],
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
