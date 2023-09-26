import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { statusList } from '../status.js';

export const GARDE_ATLANTE: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['rasca', 'thanks'],
		initialStep: true
	},
	rasca: {
		stepName: 'rasca',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.RASCAPHANDRE_DECOY,
			reverse: true
		},
		nextStep: ['where', 'thanks']
	},
	where: {
		stepName: 'where',
		nextStep: ['call', 'thanks']
	},
	call: {
		stepName: 'call',
		nextStep: ['appeau', 'thanks']
	},
	appeau: {
		stepName: 'appeau',
		nextStep: ['old', 'thanks']
	},
	old: {
		stepName: 'old',
		nextStep: ['thanks'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.JVBZ
			}
		]
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
