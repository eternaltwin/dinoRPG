import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { NpcData } from '../NpcData.mjs';

export const HULOT: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['welcome', 'sick', 'sickstatus'],
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
		nextStep: ['whynot', 'fauna', 'myst', 'missions', 'lowLevel']
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
		alias: 'missions',
		target: 'missions',
		nextStep: []
	},
	missions: {
		stepName: 'missions',
		condition: {
			[Operator.AND]: [{ [ConditionEnum.STATUS]: DinozStatusId.HUMISS }, { [ConditionEnum.MINLEVEL]: 20 }]
		},
		nextStep: []
	},
	lowLevel: {
		stepName: 'lowLevel',
		nextStep: [],
		condition: {
			[ConditionEnum.MAXLEVEL]: 19
		}
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
