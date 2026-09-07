import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum, TriggerEnum } from '../../enums/Parser.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { NpcData } from '../NpcData.mjs';

export const ARCHISAGE: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['enigm'],
		initialStep: true
	},
	enigm: {
		stepName: 'enigm',
		nextStep: ['next']
	},
	next: {
		stepName: 'next',
		nextStep: ['tresor']
	},
	tresor: {
		stepName: 'tresor',
		nextStep: ['quoi']
	},
	quoi: {
		stepName: 'quoi',
		nextStep: ['show']
	},
	show: {
		stepName: 'show',
		nextStep: ['show_win'],
		fight: [bossList.ELEMENTAIRE_TERRE],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.BASALT_SHARD },
				{ [ConditionEnum.STATUS]: DinozStatusId.PURE_WATER },
				{ [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MUD }
			]
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.BASALT_SHARD,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.PURE_WATER,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SWAMP_MUD,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.ZORS_GLOVE
			}
		]
	},
	show_win: {
		stepName: 'show_win',
		nextStep: []
	}
};
