import { statusList } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

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
			[Operator.NOT]: { [ConditionEnum.STATUS]: statusList.GRDMIS }
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
			[ConditionEnum.STATUS]: statusList.GRDMIS
		},
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
