import { statusList } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

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
				value: statusList.QWHY
			}
		]
	},
	wood: {
		stepName: 'wood',
		nextStep: ['why', 'tame', 'interest', 'missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.QWOOD
			}
		]
	},
	tame: {
		stepName: 'tame',
		nextStep: ['why', 'wood', 'interest', 'missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.QTAME
			}
		]
	},
	interest: {
		stepName: 'interest',
		nextStep: ['service'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: statusList.QTAME },
				{ [ConditionEnum.STATUS]: statusList.QWOOD },
				{ [ConditionEnum.STATUS]: statusList.QWHY },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.DIAN } }
			]
		}
	},
	service: {
		stepName: 'service',
		nextStep: ['missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.DIAN
			}
		]
	},
	missions: {
		stepName: 'missions',
		nextStep: [],
		condition: {
			[ConditionEnum.STATUS]: statusList.DIAN
		}
	},
	nothing: {
		stepName: 'nothing',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
