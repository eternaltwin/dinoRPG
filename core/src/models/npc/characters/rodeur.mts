import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { Item, itemList } from '../../item/ItemList.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { Reward } from '../../reward/RewardList.mjs';
import { NpcData } from '../NpcData.mjs';

export const RODEUR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		condition: {
			// Initial step if the dinoz is at least level 15 and has not finished the first mission
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 15 },
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ } }
			]
		},
		nextStep: ['go', 'talk', 'talk2'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		condition: {
			[Operator.NOT]: { [ConditionEnum.CURRENT_MISSION]: MissionID.RODEUR_RODRIZ }
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
			[ConditionEnum.CURRENT_MISSION]: MissionID.RODEUR_RODRIZ
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
		nextStep: []
	},
	begin_2: {
		stepName: 'begin_2',
		condition: {
			// Initial step if the dinoz is at least level 20 and has finished the first mission but not the last one
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
		nextStep: ['missions']
	},
	missions_2: {
		stepName: 'missions_2',
		nextStep: []
	},
	begin_3: {
		stepName: 'begin_3',
		nextStep: ['next_2'],
		condition: {
			// Initial step if the dinoz has completed the last mission and the player does not have the Tik reward
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODLIF },
				{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.TIK } }
			]
		},
		initialStep: true
	},
	next_2: {
		stepName: 'next_2',
		nextStep: [],
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
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
