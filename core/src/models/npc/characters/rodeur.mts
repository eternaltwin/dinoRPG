import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { itemList } from '../../item/ItemList.mjs';

export const RODEUR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
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
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const RODEUR2: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
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
	missions: {
		stepName: 'missions',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const RODEUR3: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['next'],
		initialStep: true
	},
	next: {
		stepName: 'next',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.ITEM,
				quantity: 1,
				value: itemList.TIK_BRACELET.itemId
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
