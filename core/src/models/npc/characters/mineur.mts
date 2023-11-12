import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from "../../enums/Parser.mjs";
import { NpcData } from "../NpcData.mjs";

export const MINEUR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['yes', 'nothing', 'repair', 'nothing2', 'repair2', 'no'],
		initialStep: true
	},
	thanks: {
		stepName: 'thanks',
		nextStep: []
	},
	yes: {
		stepName: 'yes',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.SHOVEL,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.ENHANCED_SHOVEL,
				reverse: true,
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: statusList.BROKEN_SHOVEL,
					reverse: true,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.STATUS,
						value: statusList.BROKEN_ENHANCED_SHOVEL,
						reverse: true
					}
				}
			}
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.SHOVEL
			}
		],
		nextStep: ['thanks']
	},
	nothing: {
		stepName: 'nothing',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.SHOVEL
		},
		nextStep: ['thanks']
	},
	repair: {
		stepName: 'repair',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.BROKEN_SHOVEL
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.SHOVEL
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.BROKEN_SHOVEL,
				reverse: true
			}
		],
		nextStep: ['thanks']
	},
	nothing2: {
		stepName: 'nothing2',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.ENHANCED_SHOVEL
		},
		nextStep: ['thanks']
	},
	repair2: {
		stepName: 'repair2',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.BROKEN_ENHANCED_SHOVEL
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ENHANCED_SHOVEL
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.BROKEN_ENHANCED_SHOVEL,
				reverse: true
			}
		],
		nextStep: ['thanks']
	},
	no: {
		stepName: 'no',
		nextStep: ['next']
	},
	next: {
		stepName: 'next',
		nextStep: ['next2']
	},
	next2: {
		stepName: 'next2',
		nextStep: ['next3']
	},
	next3: {
		stepName: 'next3',
		nextStep: ['qui']
	},
	qui: {
		stepName: 'qui',
		nextStep: ['ok']
	},
	ok: {
		stepName: 'ok',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
