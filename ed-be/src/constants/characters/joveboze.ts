import { ConditionEnum, RewardEnum, TriggerEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { statusList } from '../status.js';
import { monsterList } from '../monster.js';
import { bossList } from '../boss.js';

export const JOVEBOZE_RASCA: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['trad', 'sry'],
		initialStep: true
	},
	trad: {
		stepName: 'trad',
		nextStep: []
	},
	sry: {
		stepName: 'sry',
		nextStep: ['go', 'trad']
	},
	go: {
		stepName: 'go',
		nextStep: ['attack', 'back']
	},
	back: {
		stepName: 'back',
		nextStep: [],
		target: 'attack'
	},
	attack: {
		stepName: 'attack',
		nextStep: [],
		action: {
			enemies: [bossList.RASCAPHANDRE],
			actionType: TriggerEnum.FIGHT
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.RASCAPHANDRE_DECOY
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.JVBZ,
				reverse: true
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
