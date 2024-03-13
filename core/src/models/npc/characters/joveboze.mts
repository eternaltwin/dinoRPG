import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { TriggerEnum, RewardEnum } from '../../enums/Parser.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { NpcData } from '../NpcData.mjs';

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
		nextStep: ['attack_win'],
		fight: [bossList.RASCAPHANDRE],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.RASCAPHANDRE_DECOY
			}
		]
	},
	attack_win: {
		stepName: 'attack_win',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.JVBZ,
				reverse: true
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
