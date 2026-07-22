import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

export const DIANKORGSEY: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['korgons', 'nothing', 'missions'],
		initialStep: true
	},
	korgons: {
		stepName: 'korgons',
		nextStep: ['why', 'wood', 'tame', 'interest', 'missions']
	},
	why: {
		stepName: 'why',
		nextStep: ['wood', 'tame', 'interest', 'missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.QWHY
			}
		]
	},
	wood: {
		stepName: 'wood',
		nextStep: ['why', 'tame', 'interest', 'missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.QWOOD
			}
		]
	},
	tame: {
		stepName: 'tame',
		nextStep: ['why', 'wood', 'interest', 'missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.QTAME
			}
		]
	},
	interest: {
		stepName: 'interest',
		nextStep: ['service'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.QTAME },
				{ [ConditionEnum.STATUS]: DinozStatusId.QWOOD },
				{ [ConditionEnum.STATUS]: DinozStatusId.QWHY },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.DIAN } }
			]
		}
	},
	service: {
		stepName: 'service',
		nextStep: ['missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.DIAN
			}
		]
	},
	missions: {
		stepName: 'missions',
		nextStep: [],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.DIAN
		},
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	},
	nothing: {
		stepName: 'nothing',
		nextStep: []
	}
};
