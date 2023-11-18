import { statusList } from '../../dinoz/StatusList.mjs';
import { RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

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
