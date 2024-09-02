import { RewardEnum, ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { itemList, Item } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { PlaceEnum } from '../../enums/PlaceEnum.mjs';
import { specialActionsList } from '../../missions/specialActionsList.mjs';

export const M_MMEX: Mission[] = [
	// Missions 51 to 55
	{
		missionId: MissionID.MMEX_MMEX1,
		missionName: 'mmex1',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 10
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 300
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'malette',
					action: 'nothing'
				},
				displayedAction: 'malette',
				displayedText: 'malette'
			},
			{
				stepId: 1,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmex'
				},
				displayedAction: 'trapp',
				displayedText: 'trapp'
			},
			{
				stepId: 2,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					target: specialActionsList.TRAP.opponents,
					action: 'piege'
				},
				displayedAction: 'piege'
			},
			{
				stepId: 3,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'forcebrut'
				},
				displayedAction: 'forcebrut',
				displayedText: 'forcebrut'
			}
		]
	},
	{
		missionId: MissionID.MMEX_MMEX2,
		missionName: 'mmex2',
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.FIGHT_RATION].itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'research',
					action: 'nothing'
				},
				displayedAction: 'research',
				displayedText: 'research'
			},
			{
				stepId: 1,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					target: specialActionsList.ATTACK.opponents,
					action: 'attack'
				},
				displayedAction: 'attack'
			},
			{
				stepId: 2,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'research',
					action: 'nothing'
				},
				displayedAction: 'research',
				displayedText: "research_2"
			},
			{
				stepId: 3,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					target: specialActionsList.ATTACK_2.opponents,
					action: 'attack'
				},
				displayedAction: 'attack'
			},
			{
				stepId: 4,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'forcebrut'
				},
				displayedAction: 'forcebrut',
				displayedText: 'forcebrut'
			}
			
		]
	},
	{
		missionId: MissionID.MMEX_MMEX3,
		missionName: 'mmex3',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.MMEX_MMEX1 },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.MMEX_MMEX2 }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 50
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'portrait',
					action: 'nothing'
				},
				displayedAction: 'portrait',
				displayedText: 'portrait'
			},
			{
				stepId: 1,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					target: specialActionsList.INVESTIGATION.opponents,
					action: 'investigate'
				},
				displayedAction: 'investigate'
			},
			{
				stepId: 2,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmex'
				},
				displayedAction: 'mmex',
				displayedText: "mmex"
			},
			{
				stepId: 3,
				place: PlaceEnum.COLLINES_ESCARPEES,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'attendre',
					action: 'nothing'
				},
				displayedAction: 'attendre',
				displayedText: "wait"
			},
			{
				stepId: 4,
				place: PlaceEnum.COLLINES_ESCARPEES,
				requirement: {
					actionType: ConditionEnum.HOUR,
					value: 3,
					target: 'wait',
					action: 'wait'
				},
				displayedAction: 'wait'
			},
			{
				stepId: 5,
				place: PlaceEnum.COLLINES_ESCARPEES,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'messageMX',
					action: 'nothing'
				},
				displayedAction: 'messageMX',
				displayedText: "messageMX"
			},
			{
				stepId: 6,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'marchand',
					action: 'nothing'
				},
				displayedAction: 'marchand',
				displayedText: "marchand"
			},
			{
				stepId: 7,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'forcebrut'
				},
				displayedAction: 'forcebrut',
				displayedText: "forcebrut"
			}
		]
	},
	{
		missionId: MissionID.MMEX_MMEX4,
		missionName: 'mmex4',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.MMEX_MMEX3
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 1000
			},
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
					actionType: ConditionEnum.TALKTO,
					target: 'investigate',
					action: 'nothing'
				},
				displayedAction: 'investigate',
				displayedText: "investigate"
			},
			{
				stepId: 1,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					target: specialActionsList.NEUTRALIZE_THEM.opponents,
					action: "neutralize_them"
				},
				displayedAction: 'neutralize_them'
			},
			{
				stepId: 2,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'jean_hubert'
				},
				displayedAction: 'jean_hubert',
				displayedText: 'jean_hubert'
			},
			{
				stepId: 3,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'charles_edouard'
				},
				displayedAction: 'charles_edouard',
				displayedText: 'charles_edouard'
			},
			{
				stepId: 4,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'louis_stanislas'
				},
				displayedAction: 'louis_stanislas',
				displayedText: 'louis_stanislas'
			},
			{
				stepId: 5,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmex'
				},
				displayedAction: 'mmex',
				displayedText: 'mmex_1'
			},
			{
				stepId: 6,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmex'
				},
				displayedAction: 'mmex',
				displayedText: 'mmex_2'
			},
			{
				stepId: 7,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'louis_stanislas'
				},
				displayedAction: 'louis_stanislas',
				displayedText: 'louis_stanislas_2'
			},
			{
				stepId: 8,
				place: PlaceEnum.UNIVERSITE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'bibliotheque',
					action: 'nothing'
				},
				displayedAction: 'bibliotheque',
				displayedText: 'bibliotheque'
			},
			{
				stepId: 9,
				place: PlaceEnum.UNIVERSITE,
				requirement: {
					actionType: ConditionEnum.HOUR,
					value: 30,
					target: 'wait',
					action: 'wait'
				},
				displayedAction: 'wait'
			},
			{
				stepId: 10,
				place: PlaceEnum.UNIVERSITE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'jean_hubert'
				},
				displayedAction: 'jean_hubert',
				displayedText: 'jean_hubert_2'
			},
			{
				stepId: 11,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'forcebrut'
				},
				displayedAction: 'forcebrut',
				displayedText: 'forcebrut'
			}
		]
	},
	{
		missionId: MissionID.MMEX_MMEX5,
		missionName: 'mmex5',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.MMEX_MMEX3
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 1000
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'indic'
				},
				displayedAction: 'indic',
				displayedText: "indic"
			},
			{
				stepId: 1,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'to_hide',
					action: 'nothing'
				},
				displayedAction: 'to_hide',
				displayedText: "to_hide"
			},
			{
				stepId: 2,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.HOUR,
					value: 10,
					target: 'wait',
					action: 'wait'
				},
				displayedAction: 'wait'
			},
			{
				stepId: 3,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'suspects',
					action: 'nothing'
				},
				displayedAction: 'suspects',
				displayedText: "suspects"
			},
			{
				stepId: 4,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'filature',
					action: 'nothing'
				},
				displayedAction: 'filature',
				displayedText: "filature"
			},
			{
				stepId: 5,
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'filature',
					action: 'nothing'
				},
				displayedAction: 'filature',
				displayedText: "filature_2"
			},
			{
				stepId: 6,
				place: PlaceEnum.FOSSELAVE,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'suspects',
					action: 'nothing'
				},
				displayedAction: 'suspects',
				displayedText: "suspects_2"
			},
			{
				stepId: 7,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					target: specialActionsList.RUSH_HIM.opponents,
					action: 'rush_him'
				},
				displayedAction: 'rush_him'
			},
			{
				stepId: 8,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'fouiller',
					action: 'nothing'
				},
				displayedAction: 'fouiller',
				displayedText: 'fouiller'
			},
			{
				stepId: 9,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'mmex',
					action: 'nothing'
				},
				displayedAction: 'mmex',
				displayedText: 'mmex'
			},
			{
				stepId: 10,
				place: PlaceEnum.RUINES_ASHPOUK,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'to_hide',
					action: 'nothing'
				},
				displayedAction: 'to_hide',
				displayedText: 'to_hide_2'
			},
			{
				stepId: 11,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.HOUR,
					value: 5,
					target: 'wait',
					action: 'wait'
				},
				displayedAction: 'wait'
			},
			{
				stepId: 12,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'suspects',
				},
				displayedAction: 'suspects',
				displayedText: 'suspects_3'
			},
			{
				stepId: 13,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'merguez',
				},
				displayedAction: 'merguez',
				displayedText: 'merguez'
			},
			{
				stepId: 14,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'suspects',
				},
				displayedAction: 'suspects',
				displayedText: 'suspects_4'
			},
			{
				stepId: 15,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					target: specialActionsList.RUSH_THEM.opponents,
					action: 'rush_them'
				},
				displayedAction: 'rush_them'
			},
			{
				stepId: 16,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'forcebrut'
				},
				displayedAction: 'forcebrut',
				displayedText: "forcebrut"
			}
		]
	}
];
