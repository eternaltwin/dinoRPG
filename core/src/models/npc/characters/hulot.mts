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
		nextStep: ['who', 'better', 'missions'],
		condition: {
			[Operator.OR]: [
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_TOXIC } },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE }
			]
		}
	},
	better: {
		stepName: 'better',
		nextStep: ['flora', 'fauna', 'myst', 'missions'],
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
		nextStep: ['flora', 'fauna', 'myst', 'missions']
	},
	myst: {
		stepName: 'myst',
		nextStep: ['flora', 'fauna', 'fear', 'missions']
	},
	flora: {
		stepName: 'flora',
		nextStep: ['whynot', 'fauna', 'myst', 'missions']
	},
	fauna: {
		stepName: 'fauna',
		nextStep: ['flora', 'myst', 'missions']
	},
	whynot: {
		stepName: 'whynot',
		nextStep: ['fear', 'other', 'missions']
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
		nextStep: ['missions'],
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
			[ConditionEnum.STATUS]: DinozStatusId.HUMISS
		},
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
