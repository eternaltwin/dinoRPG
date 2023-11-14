import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, Operator, RewardEnum } from "../../enums/Parser.mjs";
import { NpcData } from "../NpcData.mjs";

export const GARDE_ATLANTE: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['rasca', 'thanks'],
		initialStep: true
	},
	rasca: {
		stepName: 'rasca',
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: statusList.RASCAPHANDRE_DECOY },
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
