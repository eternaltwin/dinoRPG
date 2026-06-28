import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

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
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.GRDMIS }
		}
	},
	item: {
		stepName: 'item',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.GRDMIS
			}
		],
		nextStep: ['missions']
	},
	missions: {
		stepName: 'missions',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.GRDMIS
		},
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	}
};
