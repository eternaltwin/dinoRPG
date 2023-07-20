import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { statusList } from '../status.js';

export const GARDIEN: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['missions', 'shake'],
		initialStep: true
	},
	shake: {
		stepName: 'shake',
		nextStep: ['item'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.GRDMIS,
			reverse: true
		}
	},
	item: {
		stepName: 'item',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.GRDMIS
			}
		],
		nextStep: ['missions']
	},
	missions: {
		stepName: 'missions',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.GRDMIS
		},
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
