import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { NpcData } from '../NpcData.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

export const HULOT: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['welcome', 'sick', 'sickstatus', 'pac_kazka', 'pac_coq', 'pac_flam'],
		initialStep: true
	},
	welcome: {
		stepName: 'welcome',
		nextStep: ['who', 'better', 'missions', 'lowLevel'],
		condition: {
			[Operator.OR]: [
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_TOXIC } },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE }
			]
		}
	},
	better: {
		stepName: 'better',
		nextStep: ['flora', 'fauna', 'myst', 'missions', 'lowLevel'],
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE
		}
	},
	sick: {
		stepName: 'sick',
		nextStep: ['problem'],
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE } },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_TOXIC },
				{ [Operator.NOT]: { [ConditionEnum.CURRENT_MISSION]: MissionID.HULOT_HUCURE } }
			]
		}
	},
	sickstatus: {
		stepName: 'sickstatus',
		nextStep: ['curesearch'],
		condition: {
			[ConditionEnum.CURRENT_MISSION]: MissionID.HULOT_HUCURE
		}
	},
	who: {
		stepName: 'who',
		nextStep: ['role'],
		condition: {
			[Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE }
		}
	},
	role: {
		stepName: 'role',
		nextStep: ['flora', 'fauna', 'myst', 'missions', 'lowLevel']
	},
	myst: {
		stepName: 'myst',
		nextStep: ['flora', 'fauna', 'fear', 'missions', 'lowLevel']
	},
	flora: {
		stepName: 'flora',
		nextStep: ['whynot', 'fauna', 'myst', 'missions', 'lowLevel', 'pac_shine']
	},
	fauna: {
		stepName: 'fauna',
		nextStep: ['flora', 'myst', 'missions', 'lowLevel']
	},
	whynot: {
		stepName: 'whynot',
		nextStep: ['fear', 'other', 'missions', 'lowLevel']
	},
	fear: {
		stepName: 'fear',
		nextStep: ['explore', 'other'],
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.HUMISS }
		}
	},
	explore: {
		stepName: 'explore',
		nextStep: ['missions', 'lowLevel'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.HUMISS
			}
		]
	},
	other: {
		stepName: 'other',
		nextStep: ['flora', 'fauna', 'myst', 'missions']
	},
	problem: {
		stepName: 'problem',
		nextStep: ['missions']
	},
	curesearch: {
		stepName: 'curesearch',
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		],
		nextStep: []
	},
	missions: {
		stepName: 'missions',
		condition: {
			[Operator.AND]: [{ [ConditionEnum.STATUS]: DinozStatusId.HUMISS }, { [ConditionEnum.MINLEVEL]: 20 }]
		},
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	},
	lowLevel: {
		stepName: 'lowLevel',
		nextStep: [],
		condition: {
			[ConditionEnum.MAXLEVEL]: 19
		}
	},
	pac_shine: {
		stepName: 'pac_shine',
		nextStep: ['pac_progress'],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.PAC, 4, '=']
		}
	},
	pac_progress: {
		stepName: 'pac_progress',
		nextStep: [],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.PAC, 4, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.PAC,
				step: 5
			}
		]
	},
	pac_kazka: {
		stepName: 'pac_kazka',
		nextStep: [],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.PAC, 6, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.PAC,
				step: 7
			}
		]
	},
	pac_flam: {
		stepName: 'pac_flam',
		nextStep: [],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.PAC, 8, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.PAC,
				step: 9
			}
		]
	},
	pac_coq: {
		stepName: 'pac_coq',
		nextStep: [],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.PAC, 10, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.PAC,
				step: 11
			}
		]
	}
};
