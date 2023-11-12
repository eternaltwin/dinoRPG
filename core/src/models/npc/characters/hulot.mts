import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from "../../enums/Parser.mjs";
import { MissionID } from "../../missions/missionList.mjs";
import { NpcData } from "../NpcData.mjs";

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
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: MissionID.HULOT_TOXIC,
			reverse: true,
			operator: ConditionOperatorEnum.OR,
			nextCondition: {
				conditionType: ConditionEnum.FINISHED_MISSION,
				value: MissionID.HULOT_HUCURE
			}
		}
	},
	better: {
		stepName: 'better',
		nextStep: ['flora', 'fauna', 'myst', 'missions'],
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: MissionID.HULOT_HUCURE
		}
	},
	sick: {
		stepName: 'sick',
		nextStep: ['problem'],
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: MissionID.HULOT_HUCURE,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.FINISHED_MISSION,
				value: MissionID.HULOT_TOXIC,
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.CURRENT_MISSION,
					value: 'hucure',
					reverse: true
				}
			}
		}
	},
	sickstatus: {
		stepName: 'sickstatus',
		nextStep: ['curesearch'],
		condition: {
			conditionType: ConditionEnum.CURRENT_MISSION,
			value: 'hucure'
		}
	},
	who: {
		stepName: 'who',
		nextStep: ['role'],
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: MissionID.HULOT_HUCURE,
			reverse: true
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
			conditionType: ConditionEnum.STATUS,
			value: statusList.HUMISS,
			reverse: true
		}
	},
	explore: {
		stepName: 'explore',
		nextStep: ['missions'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.HUMISS
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
			conditionType: ConditionEnum.STATUS,
			value: statusList.HUMISS
		},
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
