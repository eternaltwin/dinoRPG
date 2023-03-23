import { ConditionEnum, ConditionOperatorEnum, NpcData, RewardEnum } from '../../models/index.js';

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
				value: 'QWHY'
			}
		]
	},
	wood: {
		stepName: 'wood',
		nextStep: ['why', 'tame', 'interest', 'missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'QWOOD'
			}
		]
	},
	tame: {
		stepName: 'tame',
		nextStep: ['why', 'wood', 'interest', 'missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'QTAME'
			}
		]
	},
	interest: {
		stepName: 'interest',
		nextStep: ['service'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'QTAME',
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'QWOOD',
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'QWHY',
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.STATUS,
						value: 'DIAN',
						reverse: true
					}
				}
			}
		}
	},
	service: {
		stepName: 'service',
		nextStep: ['missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'DIAN'
			}
		]
	},
	missions: {
		stepName: 'missions',
		nextStep: [],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'DIAN'
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
