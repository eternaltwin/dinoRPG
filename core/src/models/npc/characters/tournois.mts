import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

export const FB_TOURNAMENT: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['yes', 'ok', 'no'],
		initialStep: true
	},
	yes: {
		stepName: 'yes',
		condition: { [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ASHPOUK_TOTEM } },
		nextStep: []
	},
	ok: {
		stepName: 'ok',
		condition: { [ConditionEnum.STATUS]: DinozStatusId.ASHPOUK_TOTEM },
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.TOURNA
			}
		],
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
