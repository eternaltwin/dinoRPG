import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, RewardEnum } from '../../enums/Parser.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { NpcData } from '../NpcData.mjs';

export const JOVEBOZE_RASCA: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['trad', 'sry'],
		initialStep: true,
		condition: { [ConditionEnum.STATUS]: DinozStatusId.RASCAPHANDRE_DECOY }
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
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.JVBZ,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN
			}
		]
	},
	attack_win: {
		stepName: 'attack_win',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN,
				reverse: true
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	},
	weirdSwamp: {
		stepName: 'weirdSwamp',
		nextStep: ['trad', 'swampTreasure'],
		initialStep: true,
		condition: { [ConditionEnum.STATUS]: DinozStatusId.WEIRD_SWAMP_SEEN }
	},
	swampTreasure: {
		stepName: 'swampTreasure',
		nextStep: ['swampLeave'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SWAMP_MONSTERS_KNOWN
			}
		]
	},
	swampLeave: {
		stepName: 'swampLeave',
		nextStep: []
	}
};
