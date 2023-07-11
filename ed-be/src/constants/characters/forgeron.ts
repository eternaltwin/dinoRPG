import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { statusList } from '../status.js';

export const FORGERON: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['repair', 'repair2', 'pelle', 'no'],
		initialStep: true
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
