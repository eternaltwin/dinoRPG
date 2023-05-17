import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';

export const BAOFAN: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['ok'],
		initialStep: true
	},
	ok: {
		stepName: 'ok',
		nextStep: ['wah']
	},
	wah: {
		stepName: 'wah',
		nextStep: ['yes', 'nothing', 'no']
	},
	nothing: {
		stepName: 'nothing',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'WATER_CHARM'
		},
		nextStep: []
	},
	yes: {
		stepName: 'yes',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'WATER_CHARM',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'WATER_CHARM'
			}
		],
		nextStep: ['spirit']
	},
	spirit: {
		stepName: 'spirit',
		nextStep: ['thanks']
	},
	thanks: {
		stepName: 'thanks',
		nextStep: []
	},
	no: {
		stepName: 'no',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
