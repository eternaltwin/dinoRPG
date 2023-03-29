import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';

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
			value: 'SHOVEL',
			reverse: true,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'ENHANCED_SHOVEL',
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'BROKEN_SHOVEL',
					reverse: true,
					nextCondition: {
						conditionType: ConditionEnum.STATUS,
						value: 'BROKEN_ENHANCED_SHOVEL',
						reverse: true
					}
				}
			}
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'SHOVEL'
			}
		],
		nextStep: ['thanks']
	},
	nothing: {
		stepName: 'nothing',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'SHOVEL'
		},
		nextStep: ['thanks']
	},
	repair: {
		stepName: 'repair',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'BROKEN_SHOVEL'
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'SHOVEL'
			},
			{
				rewardType: RewardEnum.STATUS,
				value: 'BROKEN_SHOVEL',
				reverse: true
			}
		],
		nextStep: ['thanks']
	},
	nothing2: {
		stepName: 'nothing2',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'ENHANCED_SHOVEL'
		},
		nextStep: ['thanks']
	},
	repair2: {
		stepName: 'repair2',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'BROKEN_ENHANCED_SHOVEL'
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'ENHANCED_SHOVEL'
			},
			{
				rewardType: RewardEnum.STATUS,
				value: 'BROKEN_ENHANCED_SHOVEL',
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
