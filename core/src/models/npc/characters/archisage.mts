import { statusList } from "../../dinoz/StatusList.mjs";
import { RewardEnum, TriggerEnum } from "../../enums/Parser.mjs";
import { bossList } from "../../fight/BossList.mjs";
import { NpcData } from "../NpcData.mjs";


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
		nextStep: [],
		action: {
			enemies: [bossList.ELEMENTAIRE_TERRE],
			actionType: TriggerEnum.FIGHT
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.BASALT_SHARD,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.PURE_WATER,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.SWAMP_MUD,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ZORS_GLOVE
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
