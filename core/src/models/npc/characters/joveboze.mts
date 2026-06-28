import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { NpcData } from '../NpcData.mjs';

export const JOVEBOZE_RASCA: Readonly<Record<string, NpcData>> = {
	// Rasca quest
	begin: {
		stepName: 'begin',
		nextStep: ['trad', 'sry'],
		initialStep: true,
		// Because there are multiple initial steps, the specific conditions must be duplicated with the NPC conditions
		condition: { [ConditionEnum.STATUS]: DinozStatusId.JVBZ }
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
		redirect: 'attack'
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
			}
		]
	},
	attack_win: {
		stepName: 'attack_win',
		nextStep: [],
	},
	// Weird swamp quest
	weirdSwamp: {
		stepName: 'weirdSwamp',
		nextStep: ['trad', 'swampTreasure'],
		initialStep: true,
		// Because there are multiple initial steps, the specific conditions must be duplicated with the NPC conditions
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.WEIRD_SWAMP_SEEN },
				{ [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MONSTERS_KNOWN } }
			]
		}
	},
	swampTreasure: {
		stepName: 'swampTreasure',
		nextStep: ['swampLeave']
	},
	swampLeave: {
		stepName: 'swampLeave',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SWAMP_MONSTERS_KNOWN
			}
		]
	}
};
