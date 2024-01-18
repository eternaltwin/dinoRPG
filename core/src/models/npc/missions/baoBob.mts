import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { PlaceEnum } from '../../enums/PlaceEnum.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { rewardList } from '../../reward/RewardList.mjs';

export const M_BAO_BOB: Mission[] = [
	// Missions 12 to 21
	{
		missionId: MissionID.BAO_BOB_KILPIR,
		missionName: 'kilpir',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.PIRA.name],
					value: 6
				},
				displayedAction: 'killPira'
			},
			{
				stepId: 1,
				place: PlaceEnum.ILE_WAIKIKI,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'sophie'
				},
				displayedAction: 'sophie',
				displayedText: 'sophie'
			},
			{
				stepId: 2,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_TROC,
		missionName: 'troc',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 100
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 2000
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.MINES_DE_CORAIL,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'marchand'
				},
				displayedAction: 'marchand',
				displayedText: 'marchand'
			},
			{
				stepId: 1,
				place: PlaceEnum.ILE_WAIKIKI,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'amoureux'
				},
				displayedAction: 'amoureux',
				displayedText: 'amoureux'
			},
			{
				stepId: 2,
				place: PlaceEnum.CHUTES_MUTANTES,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'bijoutier'
				},
				displayedAction: 'bijoutier',
				displayedText: 'bijoutier'
			},
			{
				stepId: 3,
				place: PlaceEnum.MARAIS_COLLANT,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'touriste'
				},
				displayedAction: 'touriste',
				displayedText: 'touriste'
			},
			{
				stepId: 4,
				place: PlaceEnum.MINES_DE_CORAIL,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'artiste'
				},
				displayedAction: 'artiste',
				displayedText: 'artiste'
			},
			{
				stepId: 5,
				place: PlaceEnum.BAO_BOB,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'dame'
				},
				displayedAction: 'dame',
				displayedText: 'dame'
			},
			{
				stepId: 6,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_KILKSK,
		missionName: 'kilksk',
		condition: {
			[Operator.AND]: [{ [ConditionEnum.FINISHED_MISSION]: MissionID.BAO_BOB_KILPIR }, { [ConditionEnum.MINLEVEL]: 8 }]
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 2000
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.DOME_SOULAFLOTTE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KAZKA.name],
					value: 6
				},
				displayedAction: 'killKazka',
				displayedText: 'killKazka'
			},
			{
				stepId: 1,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_KILANG,
		missionName: 'kilang',
		condition: {
			[Operator.AND]: [{ [ConditionEnum.FINISHED_MISSION]: MissionID.BAO_BOB_KILKSK }, { [ConditionEnum.MINLEVEL]: 18 }]
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 50
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 5000
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.ANYWHERE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANGUIL.name],
					value: 10
				},
				displayedAction: 'killAnguil',
				displayedText: 'killAnguil'
			},
			{
				stepId: 1,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'marchandvin'
				},
				displayedAction: 'marchand',
				displayedText: 'marchand'
			},
			{
				stepId: 2,
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'pecheur'
				},
				displayedAction: 'pecheur',
				displayedText: 'pecheur'
			},
			{
				stepId: 3,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmeseyche'
				},
				displayedAction: 'mmeseyche',
				displayedText: 'mmeseyche'
			},
			{
				stepId: 4,
				place: PlaceEnum.PAPY_JOE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'adam'
				},
				displayedAction: 'adam',
				displayedText: 'adam'
			},
			{
				stepId: 5,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_BIGPCH,
		missionName: 'bigpch',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.BAO_BOB_KILKSK
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 150
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 1500
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.ANYWHERE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KAZKA.name, monsterList.PIRA.name],
					value: 30
				},
				displayedAction: 'killAll',
				displayedText: 'killAll'
			},
			{
				stepId: 1,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_RALLY1,
		missionName: 'rally1',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 10
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape'
			},
			{
				stepId: 1,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_RALLY2,
		missionName: 'rally2',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.BAO_BOB_RALLY1
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
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape1'
			},
			{
				stepId: 1,
				place: PlaceEnum.UNIVERSITE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape2'
			},
			{
				stepId: 2,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_RALLY3,
		missionName: 'rally3',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.BAO_BOB_RALLY2
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.MINES_DE_CORAIL,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape1'
			},
			{
				stepId: 1,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape2'
			},
			{
				stepId: 2,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape3'
			},
			{
				stepId: 3,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_RALLY4,
		missionName: 'rally4',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.BAO_BOB_RALLY3
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 40
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape'
			},
			{
				stepId: 1,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	},
	{
		missionId: MissionID.BAO_BOB_TOUR,
		missionName: 'tour',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.BAO_BOB_RALLY4 },
				{ [ConditionEnum.STATUS]: DinozStatusId.FLIPPERS }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 100
			},
			{
				rewardType: RewardEnum.EPIC,
				value: rewardList.TOUR
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.ILE_WAIKIKI,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape1'
			},
			{
				stepId: 1,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape2'
			},
			{
				stepId: 2,
				place: PlaceEnum.COLLINES_ESCARPEES,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape3'
			},
			{
				stepId: 3,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape4'
			},
			{
				stepId: 4,
				place: PlaceEnum.CAMP_KORGON,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape5'
			},
			{
				stepId: 5,
				place: PlaceEnum.AUREE_DE_LA_FORET,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'etape'
				},
				displayedAction: 'etape',
				displayedText: 'etape6'
			},
			{
				stepId: 6,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'bob'
				},
				displayedAction: 'bob',
				displayedText: 'bob'
			}
		]
	}
];
