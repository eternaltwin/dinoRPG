import { statusList } from '../../dinoz/StatusList.mjs';
import { RewardEnum, ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { placeList } from '../../place/PlaceList.mjs';

export const M_SHAMAN_MOU: Array<Mission> = [
	//Missions 26 to 36
	{
		missionId: MissionID.SHAMAN_INIT1,
		missionName: 'init1',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'inscriptions'
				},
				displayedAction: 'inscriptions',
				displayedText: 'inscriptions'
			},
			{
				stepId: 1,
				place: placeList.UNIVERSITE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'dictionnaire'
				},
				hidePlace: true,
				displayedText: 'dictionnaire',
				displayedAction: 'dictionnaire'
			},
			{
				stepId: 2,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'inscriptions_decrypt'
				},
				displayedAction: 'inscriptions_decrypt',
				displayedText: 'inscriptions_decrypt'
			},
			{
				stepId: 3,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_INIT2,
		missionName: 'init2',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_INIT1
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 60
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.STRATEGY_IN_130_LESSONS
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.REPAIRE_DU_VENERABLE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'barche',
					value: 1
				},
				displayedAction: 'killBarche',
				displayedText: 'killBarche'
			},
			{
				stepId: 1,
				place: placeList.REPAIRE_DU_VENERABLE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'claw'
				},
				displayedText: 'claw',
				displayedAction: 'claw'
			},
			{
				stepId: 2,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'forgeron'
				},
				displayedAction: 'forgeron',
				displayedText: 'forgeron'
			},
			{
				stepId: 3,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'any',
					value: 6
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 4,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde'
			},
			{
				stepId: 5,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'any',
					value: 6
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 6,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde2'
			},
			{
				stepId: 7,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_BURN,
		missionName: 'burn',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_INIT2
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 40
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 2000
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'flam',
					value: 3
				},
				displayedAction: 'killFlam',
				displayedText: 'killFlam'
			},
			{
				stepId: 1,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'cinder'
				},
				displayedText: 'cinder',
				displayedAction: 'cinder'
			},
			{
				stepId: 2,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'artisan'
				},
				displayedAction: 'artisan',
				displayedText: 'artisan'
			},
			{
				stepId: 3,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'sniff'
				},
				displayedAction: 'sniff',
				displayedText: 'sniff'
			},
			{
				stepId: 4,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'flam',
					value: 5
				},
				displayedAction: 'killFlam',
				displayedText: 'killFlam'
			},
			{
				stepId: 5,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'seek'
				},
				displayedAction: 'seek',
				displayedText: 'seek'
			},
			{
				stepId: 6,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_BARBEC,
		missionName: 'barbec',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_BURN
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 40
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.SOS_FLAME.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'sbranch'
				},
				displayedAction: 'sbranch',
				displayedText: 'sbranch'
			},
			{
				stepId: 1,
				place: placeList.REPAIRE_DU_VENERABLE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'ecaille'
				},
				displayedText: 'ecaille',
				displayedAction: 'ecaille'
			},
			{
				stepId: 2,
				place: placeList.REPAIRE_DU_VENERABLE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'floor'
				},
				displayedAction: 'floor',
				displayedText: 'floor'
			},
			{
				stepId: 3,
				place: placeList.REPAIRE_DU_VENERABLE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'search'
				},
				displayedAction: 'search',
				displayedText: 'search'
			},
			{
				stepId: 4,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'basalte'
				},
				displayedAction: 'basalte',
				displayedText: 'basalte'
			},
			{
				stepId: 5,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'mix'
				},
				displayedAction: 'mix',
				displayedText: 'mix'
			},
			{
				stepId: 6,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'use'
				},
				displayedAction: 'use',
				displayedText: 'use'
			},
			{
				stepId: 7,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_JOKE,
		missionName: 'joke',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_INIT2
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 1500
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.PORT_DE_PRECHE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rfish'
				},
				displayedAction: 'rfish',
				displayedText: 'rfish'
			},
			{
				stepId: 1,
				place: placeList.UNIVERSITE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'strap'
				},
				displayedText: 'strap',
				displayedAction: 'strap'
			},
			{
				stepId: 2,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_DEFEND,
		missionName: 'defend',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_INIT2
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 60
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 4000
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.HOT_BREAD.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde1'
			},
			{
				stepId: 1,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'any',
					value: 15
				},
				displayedText: 'killAny',
				displayedAction: 'killAny'
			},
			{
				stepId: 2,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde2'
			},
			{
				stepId: 3,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'eclaireur'
				},
				displayedAction: 'eclaireur',
				displayedText: 'eclaireur'
			},
			{
				stepId: 4,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'any',
					value: 5
				},
				displayedText: 'killAny',
				displayedAction: 'killAny'
			},
			{
				stepId: 5,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'banner'
				},
				displayedAction: 'banner',
				displayedText: 'banner'
			},
			{
				stepId: 6,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde3'
			},
			{
				stepId: 7,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_SHIPMT,
		missionName: 'shipmt',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_DEFEND
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 25
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 1000
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.POTION_ANGEL.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.PENTES_DE_BASALTE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'convoy'
				},
				displayedAction: 'convoy',
				displayedText: 'convoy1'
			},
			{
				stepId: 1,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'goblin',
					value: 4
				},
				displayedText: 'killGob',
				displayedAction: 'killGob'
			},
			{
				stepId: 2,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'convoy'
				},
				displayedAction: 'convoy',
				displayedText: 'convoy2'
			},
			{
				stepId: 3,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickup'
				},
				displayedAction: 'pickup',
				displayedText: 'pickup'
			},
			{
				stepId: 4,
				place: placeList.PENTES_DE_BASALTE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'convoy'
				},
				displayedText: 'convoy3',
				displayedAction: 'convoy'
			},
			{
				stepId: 5,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'sound'
				},
				displayedAction: 'sound',
				displayedText: 'sound'
			},
			{
				stepId: 6,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'goblin',
					value: 6
				},
				displayedAction: 'killGob',
				displayedText: 'killGob'
			},
			{
				stepId: 7,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'marchandise'
				},
				displayedAction: 'pickMerchandise',
				displayedText: 'pickMerchandise'
			},
			{
				stepId: 8,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'convoy'
				},
				displayedAction: 'convoy',
				displayedText: 'convoy4'
			},
			{
				stepId: 9,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_SALES,
		missionName: 'sales',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_INIT2
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 3500
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'babioles'
				},
				displayedAction: 'babioles',
				displayedText: 'babioles'
			},
			{
				stepId: 1,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'market'
				},
				displayedText: 'market',
				displayedAction: 'market'
			},
			{
				stepId: 2,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_RITUAL,
		missionName: 'ritual',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_INIT2
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 50
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 1500
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.LITTLE_PEPPER.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.FOSSELAVE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'instruction'
				},
				displayedAction: 'instruction',
				displayedText: 'instruction'
			},
			{
				stepId: 1,
				place: placeList.ANYWHERE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'goblin',
					value: 1
				},
				displayedText: 'killGob',
				displayedAction: 'killGob'
			},
			{
				stepId: 2,
				place: placeList.ANYWHERE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'nextInstruction'
				},
				displayedAction: 'nextInstruction',
				displayedText: 'nextInstruction'
			},
			{
				stepId: 3,
				place: placeList.ANYWHERE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'shamana'
				},
				displayedAction: 'shamana',
				displayedText: 'shamana'
			},
			{
				stepId: 4,
				place: placeList.REPAIRE_DU_VENERABLE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'goblin',
					value: 3
				},
				displayedText: 'killGoblin',
				displayedAction: 'killGoblin'
			},
			{
				stepId: 5,
				place: placeList.REPAIRE_DU_VENERABLE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'donga'
				},
				displayedAction: 'donga',
				displayedText: 'donga'
			},
			{
				stepId: 6,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'goblin',
					value: 3
				},
				displayedAction: 'killGob',
				displayedText: 'killGob'
			},
			{
				stepId: 7,
				place: placeList.TUNNEL_SOUS_LA_BRANCHE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'wahhh'
				},
				displayedAction: 'wahhh',
				displayedText: 'wahhh'
			},
			{
				stepId: 8,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rock'
				},
				displayedAction: 'rock',
				displayedText: 'rock'
			},
			{
				stepId: 9,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_HIERO,
		missionName: 'hiero',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_INIT2 },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_DEFEND },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_BARBEC }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.CLOUD_BURGER.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.GORGES_PROFONDES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'hieroglyphes'
				},
				displayedAction: 'hieroglyphes',
				displayedText: 'hieroglyphes'
			},
			{
				stepId: 1,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	},
	{
		missionId: MissionID.SHAMAN_PIGEON,
		missionName: 'pigeon',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_HIERO
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 100
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 5500
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.HOT_BREAD.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.UNIVERSITE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'profLetter'
				},
				displayedAction: 'profLetter',
				displayedText: 'profLetter'
			},
			{
				stepId: 1,
				place: placeList.ILE_WAIKIKI.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'yolande'
				},
				displayedText: 'yolande',
				displayedAction: 'yolande'
			},
			{
				stepId: 2,
				place: placeList.FORCEBRUT.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'foundArcheo'
				},
				displayedAction: 'foundArcheo',
				displayedText: 'foundArcheo'
			},
			{
				stepId: 3,
				place: placeList.GORGES_PROFONDES.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'archeo'
				},
				displayedAction: 'archeo',
				displayedText: 'archeo'
			},
			{
				stepId: 4,
				place: placeList.FOSSELAVE.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'shaman'
				},
				displayedAction: 'shaman',
				displayedText: 'shaman'
			}
		]
	}
];
