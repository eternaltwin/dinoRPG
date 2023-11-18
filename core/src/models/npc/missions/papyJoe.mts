import { RewardEnum, ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { placeList } from '../../place/PlaceList.mjs';
import { rewardList } from '../../reward/RewardList.mjs';

export const M_PAPY_JOE: Array<Mission> = [
	// Missions 1 to 10
	{
		missionId: MissionID.PAPY_JOE_FISH,
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
		missionId: MissionID.PAPY_JOE_DOG,
		missionName: 'dog',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 10
			},
			{ rewardType: RewardEnum.ITEM, quantity: 1, value: itemList.POTION_ANGEL.itemId }
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
		missionId: MissionID.PAPY_JOE_KILGOU,
		missionName: 'kilgou',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_FISH
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
		missionId: MissionID.PAPY_JOE_KILWLF,
		missionName: 'kilwlf',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_KILGOU
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
		missionId: MissionID.PAPY_JOE_FFLOW,
		missionName: 'fflow',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_FISH
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
		missionId: MissionID.PAPY_JOE_KBOOK,
		missionName: 'kbook',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_FFLOW
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
		missionId: MissionID.PAPY_JOE_MSG,
		missionName: 'msg',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_KBOOK
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.EPIC,
				value: rewardList.MSG
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
		missionId: MissionID.PAPY_JOE_LETTRE,
		missionName: 'lettre',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_MSG
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
		missionId: MissionID.PAPY_JOE_KILGLU,
		missionName: 'kilglu',
		condition: {
			[Operator.AND]: [{ [ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_KILWLF }, { [ConditionEnum.MINLEVEL]: 4 }]
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
		missionId: MissionID.PAPY_JOE_KILGNT,
		missionName: 'kilgnt',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_KILGLU },
				{ [ConditionEnum.MINLEVEL]: 11 }
			]
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
		missionId: MissionID.PAPY_JOE_KILCOQ,
		missionName: 'kilcoq',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.PAPY_JOE_KILGNT },
				{ [ConditionEnum.MINLEVEL]: 18 }
			]
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
