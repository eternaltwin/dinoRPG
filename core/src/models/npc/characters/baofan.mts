import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

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
			[ConditionEnum.STATUS]: DinozStatusId.WATER_CHARM
		},
		nextStep: []
	},
	yes: {
		stepName: 'yes',
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.WATER_CHARM }
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.WATER_CHARM
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
