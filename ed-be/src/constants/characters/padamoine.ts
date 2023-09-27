import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { statusList } from '../status.js';

export const PADAMOINE: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['help'],
		initialStep: true
	},
	help: {
		stepName: 'help',
		nextStep: ['get']
	},
	get: {
		stepName: 'get',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.NENUPHAR_LEAF
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ZENBRO,
				reverse: true
			}
		],
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
