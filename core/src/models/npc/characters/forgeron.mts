import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

export const FORGERON: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['repair', 'repair2', 'pelle', 'no'],
		initialStep: true
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
			},
			{
				rewardType: RewardEnum.GOLD,
				value: -100
			}
		],
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
			},
			{
				rewardType: RewardEnum.GOLD,
				value: -100
			}
		],
		nextStep: ['thanks']
	},
	pelle: {
		stepName: 'pelle',
		nextStep: []
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	thanks: {
		stepName: 'thanks',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
