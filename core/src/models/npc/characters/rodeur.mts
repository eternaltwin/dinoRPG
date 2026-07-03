import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { Item, itemList } from '../../item/ItemList.mjs';
import { Reward } from '../../reward/RewardList.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

export const RODEUR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		// Because there are multiple initial steps, the specific conditions must be duplicated with the NPC conditions
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ } },
				{ [ConditionEnum.MINLEVEL]: 15 }
			]
		},
		nextStep: ['go', 'talk', 'talk2'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		condition: {
			[Operator.NOT]: { [ConditionEnum.CURRENT_MISSION]: MissionID.RODEUR_RODLIF }
		},
		nextStep: ['go', 'yes']
	},
	go: {
		stepName: 'go',
		nextStep: []
	},
	talk2: {
		stepName: 'talk2',
		condition: {
			[ConditionEnum.CURRENT_MISSION]: MissionID.RODEUR_RODLIF
		},
		nextStep: []
	},
	yes: {
		stepName: 'yes',
		nextStep: ['go', 'read']
	},
	read: {
		stepName: 'read',
		nextStep: ['go', 'missions']
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
	begin_2: {
		stepName: 'begin_2',
		// Because there are multiple initial steps, the specific conditions must be duplicated with the NPC conditions
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ },
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODLIF } },
				{ [ConditionEnum.MINLEVEL]: 20 }
			]
		},
		nextStep: ['qual', 'qual2'],
		initialStep: true
	},
	qual: {
		stepName: 'qual',
		condition: {
			[Operator.NOT]: { [ConditionEnum.CURRENT_MISSION]: MissionID.RODEUR_RODLIF }
		},
		nextStep: ['caush', 'ether']
	},
	caush: {
		stepName: 'caush',
		nextStep: ['ether', 'next']
	},
	qual2: {
		stepName: 'qual2',
		condition: {
			[ConditionEnum.CURRENT_MISSION]: MissionID.RODEUR_RODLIF
		},
		nextStep: []
	},
	ether: {
		stepName: 'ether',
		nextStep: ['caush', 'next']
	},
	next: {
		stepName: 'next',
		nextStep: ['more']
	},
	more: {
		stepName: 'more',
		nextStep: ['missions_2']
	},
	missions_2: {
		stepName: 'missions_2',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	},
	begin_3: {
		stepName: 'begin_3',
		// Because there are multiple initial steps, the specific conditions must be duplicated with the NPC conditions
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.TIK } },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODLIF }
			]
		},
		nextStep: ['next_2'],
		initialStep: true
	},
	next_2: {
		stepName: 'next_2',
		nextStep: [],
		condition: {
			[Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.TIK }
		},
		reward: [
			{
				rewardType: RewardEnum.ITEM,
				quantity: 1,
				value: itemList[Item.TIK_BRACELET].itemId
			},
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.TIK
			}
		]
	}
};
