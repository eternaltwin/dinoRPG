import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

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
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SHOVEL } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ENHANCED_SHOVEL } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.BROKEN_SHOVEL } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.BROKEN_ENHANCED_SHOVEL } }
			]
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SHOVEL
			}
		],
		nextStep: ['thanks']
	},
	nothing: {
		stepName: 'nothing',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.SHOVEL
		},
		nextStep: ['thanks']
	},
	repair: {
		stepName: 'repair',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.BROKEN_SHOVEL
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SHOVEL
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.BROKEN_SHOVEL,
				reverse: true
			}
		],
		nextStep: ['thanks']
	},
	nothing2: {
		stepName: 'nothing2',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.ENHANCED_SHOVEL
		},
		nextStep: ['thanks']
	},
	repair2: {
		stepName: 'repair2',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.BROKEN_ENHANCED_SHOVEL
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.ENHANCED_SHOVEL
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.BROKEN_ENHANCED_SHOVEL,
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
