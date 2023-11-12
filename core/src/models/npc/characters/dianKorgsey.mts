import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from "../../enums/Parser.mjs";
import { NpcData } from "../NpcData.mjs";

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
			conditionType: ConditionEnum.STATUS,
			value: statusList.QTAME,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.QWOOD,
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: statusList.QWHY,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.STATUS,
						value: statusList.DIAN,
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
				value: statusList.DIAN
			}
		]
	},
	missions: {
		stepName: 'missions',
		nextStep: [],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.DIAN
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
