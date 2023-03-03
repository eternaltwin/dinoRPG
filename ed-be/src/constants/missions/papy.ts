import { ConditionEnum, Mission, RewardEnum } from '../../models/index.js';
import { placeList } from '../place.js';

export const MPAPY: Array<Mission> = [
	{
		missionId: 1,
		missionName: 'fish',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.PORT_DE_PRECHE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'fishVendor'
				},
				displayedAction: 'fishVendor',
				displayedText: 'fishVendor'
			},
			{
				stepId: 1,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmeseyche'
				},
				displayedAction: 'mmeseyche',
				displayedText: 'mmeSeyche'
			},
			{
				stepId: 2,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 2,
		missionName: 'dog',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 10
			},
			{ rewardType: RewardEnum.ITEM, quantity: 1, value: 'POTION_ANGEL' }
		],
		steps: [
			{
				stepId: 0,
				place: placeList.COLLINES_ESCARPEES.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmeducraft1'
				},
				displayedAction: 'mmeducraft1',
				displayedText: 'mmeducraft1'
			},
			{
				stepId: 1,
				place: placeList.PORT_DE_PRECHE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'nioufniouf'
				},
				displayedAction: 'nioufniouf',
				displayedText: 'nioufniouf'
			},
			{
				stepId: 2,
				place: placeList.COLLINES_ESCARPEES.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmeducraft2'
				},
				displayedAction: 'mmeducraft2',
				displayedText: 'mmeducraft2'
			},
			{
				stepId: 3,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe'
			}
		]
	},
	{
		missionId: 3,
		missionName: 'kilgou',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'fish'
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 500
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.COLLINES_ESCARPEES.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'goupignon:wolf',
					value: 6
				},
				displayedAction: 'killGoupi',
				displayedText: 'killGoupi'
			},
			{
				stepId: 1,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 4,
		missionName: 'kilwlf',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'kilgou'
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 200
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.FORCEBRUT.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'wolf',
					value: 2
				},
				displayedAction: 'killWolf',
				displayedText: 'killWolf'
			},
			{
				stepId: 1,
				place: placeList.FOUTAINE_DE_JOUVENCE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'wolf',
					value: 2
				},
				displayedAction: 'killWolf',
				displayedText: 'killWolf'
			},
			{
				stepId: 2,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'wolf',
					value: 2
				},
				displayedAction: 'killWolf',
				displayedText: 'killWolf'
			},
			{
				stepId: 3,
				place: placeList.UNIVERSITE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'wolf',
					value: 2
				},
				displayedAction: 'killWolf',
				displayedText: 'killWolf'
			},
			{
				stepId: 4,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 5,
		missionName: 'fflow',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'fish'
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.FOUTAINE_DE_JOUVENCE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'pureWater'
				},
				displayedAction: 'pureWater',
				displayedText: 'pureWater'
			},
			{
				stepId: 1,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmeseyche'
				},
				displayedAction: 'mmeseyche',
				displayedText: 'mmeSeyche'
			},
			{
				stepId: 2,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 6,
		missionName: 'kbook',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'fflow'
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.UNIVERSITE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'kbook'
				},
				displayedAction: 'kbook',
				displayedText: 'kbook'
			},
			{
				stepId: 1,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmeseyche'
				},
				displayedAction: 'mmeseyche',
				displayedText: 'mmeSeyche'
			},
			{
				stepId: 2,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 7,
		missionName: 'msg',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'kbook'
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.EPIC,
				value: 'MSG'
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.FOUTAINE_DE_JOUVENCE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'goupignon',
					value: 15
				},
				displayedAction: 'killGoupi',
				displayedText: 'killGoupi'
			},
			{
				stepId: 1,
				place: placeList.FOUTAINE_DE_JOUVENCE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'timbre'
				},
				displayedAction: 'timbre',
				displayedText: 'timbre'
			},
			{
				stepId: 2,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 8,
		missionName: 'lettre',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'msg'
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmeseyche'
				},
				displayedAction: 'mmeseyche',
				displayedText: 'mmeSeyche'
			},
			{
				stepId: 1,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 9,
		missionName: 'kilglu',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'kilwlf',
			nextCondition: {
				conditionType: ConditionEnum.MINLEVEL,
				value: 7
			}
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 500
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.ANYWHERE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'gluon',
					value: 1
				},
				displayedAction: 'killGluon',
				displayedText: 'killGluon'
			},
			{
				stepId: 1,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 10,
		missionName: 'kilgnt',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'kilglu',
			nextCondition: {
				conditionType: ConditionEnum.MINLEVEL,
				value: 14
			}
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 100
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 5000
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.ANYWHERE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'greeng',
					value: 12
				},
				displayedAction: 'killGvert',
				displayedText: 'killGvert'
			},
			{
				stepId: 1,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	},
	{
		missionId: 11,
		missionName: 'kilcoq',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: 'kilgnt',
			nextCondition: {
				conditionType: ConditionEnum.MINLEVEL,
				value: 21
			}
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 200
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 8000
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.ANYWHERE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'coq',
					value: 20
				},
				displayedAction: 'killCoq',
				displayedText: 'killCoq'
			},
			{
				stepId: 1,
				place: placeList.PAPY_JOE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'papyjoe'
				},
				displayedAction: 'papyjoe',
				displayedText: 'papyjoe'
			}
		]
	}
];
