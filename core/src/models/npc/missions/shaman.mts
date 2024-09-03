import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { PlaceEnum } from '../../enums/PlaceEnum.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';
import { itemList, Item } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { MapZone } from '../../enums/MapZone.mjs';

export const M_SHAMAN_MOU: Mission[] = [
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
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'inscriptions'
				},
				displayedAction: 'inscriptions',
				displayedText: 'inscriptions'
			},
			{
				stepId: 1,
				place: PlaceEnum.UNIVERSITE,
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
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'inscriptions_decrypt'
				},
				displayedAction: 'inscriptions_decrypt',
				displayedText: 'inscriptions_decrypt'
			},
			{
				stepId: 3,
				place: PlaceEnum.FOSSELAVE,
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
				value: DinozStatusId.STRATEGY_IN_130_LESSONS
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.BARCHE.name],
					value: 1,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killBarche',
				displayedText: 'killBarche'
			},
			{
				stepId: 1,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'claw'
				},
				displayedText: 'claw',
				displayedAction: 'claw'
			},
			{
				stepId: 2,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'forgeron'
				},
				displayedAction: 'forgeron',
				displayedText: 'forgeron'
			},
			{
				stepId: 3,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY.name],
					value: 6,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 4,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde'
			},
			{
				stepId: 5,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY.name],
					value: 6,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 6,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde2'
			},
			{
				stepId: 7,
				place: PlaceEnum.FOSSELAVE,
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
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.FLAM.name],
					value: 3,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killFlam',
				displayedText: 'killFlam'
			},
			{
				stepId: 1,
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'cinder'
				},
				displayedText: 'cinder',
				displayedAction: 'cinder'
			},
			{
				stepId: 2,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'artisan'
				},
				displayedAction: 'artisan',
				displayedText: 'artisan'
			},
			{
				stepId: 3,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'sniff'
				},
				displayedAction: 'sniff',
				displayedText: 'sniff'
			},
			{
				stepId: 4,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.FLAM.name],
					value: 5,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killFlam',
				displayedText: 'killFlam'
			},
			{
				stepId: 5,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'seek'
				},
				displayedAction: 'seek',
				displayedText: 'seek'
			},
			{
				stepId: 6,
				place: PlaceEnum.FOSSELAVE,
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
				value: itemList[Item.SOS_FLAME].itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'sbranch'
				},
				displayedAction: 'sbranch',
				displayedText: 'sbranch'
			},
			{
				stepId: 1,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'ecaille'
				},
				displayedText: 'ecaille',
				displayedAction: 'ecaille'
			},
			{
				stepId: 2,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'floor'
				},
				displayedAction: 'floor',
				displayedText: 'floor'
			},
			{
				stepId: 3,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'search'
				},
				displayedAction: 'search',
				displayedText: 'search'
			},
			{
				stepId: 4,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'basalte'
				},
				displayedAction: 'basalte',
				displayedText: 'basalte'
			},
			{
				stepId: 5,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'mix'
				},
				displayedAction: 'mix',
				displayedText: 'mix'
			},
			{
				stepId: 6,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'use'
				},
				displayedAction: 'use',
				displayedText: 'use'
			},
			{
				stepId: 7,
				place: PlaceEnum.FOSSELAVE,
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
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rfish'
				},
				displayedAction: 'rfish',
				displayedText: 'rfish'
			},
			{
				stepId: 1,
				place: PlaceEnum.UNIVERSITE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'strap'
				},
				displayedText: 'strap',
				displayedAction: 'strap'
			},
			{
				stepId: 2,
				place: PlaceEnum.FOSSELAVE,
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
				value: itemList[Item.HOT_BREAD].itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde1'
			},
			{
				stepId: 1,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY.name],
					value: 15,
					zone: MapZone.GTOUTCHAUD
				},
				displayedText: 'killAny',
				displayedAction: 'killAny'
			},
			{
				stepId: 2,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde2'
			},
			{
				stepId: 3,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'eclaireur'
				},
				displayedAction: 'eclaireur',
				displayedText: 'eclaireur'
			},
			{
				stepId: 4,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY.name],
					value: 5,
					zone: MapZone.GTOUTCHAUD
				},
				displayedText: 'killAny',
				displayedAction: 'killAny'
			},
			{
				stepId: 5,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'banner'
				},
				displayedAction: 'banner',
				displayedText: 'banner'
			},
			{
				stepId: 6,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'garde'
				},
				displayedAction: 'garde',
				displayedText: 'garde3'
			},
			{
				stepId: 7,
				place: PlaceEnum.FOSSELAVE,
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
				value: itemList[Item.POTION_ANGEL].itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.PENTES_DE_BASALTE,
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
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.GOBLIN.name],
					value: 4,
					zone: MapZone.GTOUTCHAUD
				},
				displayedText: 'killGob',
				displayedAction: 'killGob'
			},
			{
				stepId: 2,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'convoy'
				},
				displayedAction: 'convoy',
				displayedText: 'convoy2'
			},
			{
				stepId: 3,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickup'
				},
				displayedAction: 'pickup',
				displayedText: 'pickup'
			},
			{
				stepId: 4,
				place: PlaceEnum.PENTES_DE_BASALTE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'convoy'
				},
				displayedText: 'convoy3',
				displayedAction: 'convoy'
			},
			{
				stepId: 5,
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
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
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.GOBLIN.name],
					value: 6,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killGob',
				displayedText: 'killGob'
			},
			{
				stepId: 7,
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'marchandise'
				},
				displayedAction: 'pickMerchandise',
				displayedText: 'pickMerchandise'
			},
			{
				stepId: 8,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'convoy'
				},
				displayedAction: 'convoy',
				displayedText: 'convoy4'
			},
			{
				stepId: 9,
				place: PlaceEnum.FOSSELAVE,
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
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'babioles'
				},
				displayedAction: 'babioles',
				displayedText: 'babioles'
			},
			{
				stepId: 1,
				place: PlaceEnum.DINOVILLE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'market'
				},
				displayedText: 'market',
				displayedAction: 'market'
			},
			{
				stepId: 2,
				place: PlaceEnum.FOSSELAVE,
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
				value: itemList[Item.LITTLE_PEPPER].itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.FOSSELAVE,
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
				place: PlaceEnum.ANYWHERE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.GOBLIN.name],
					value: 1,
					zone: MapZone.GTOUTCHAUD
				},
				displayedText: 'killGob',
				displayedAction: 'killGob'
			},
			{
				stepId: 2,
				place: PlaceEnum.ANYWHERE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'nextInstruction'
				},
				displayedAction: 'nextInstruction',
				displayedText: 'nextInstruction'
			},
			{
				stepId: 3,
				place: PlaceEnum.ANYWHERE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'shamana'
				},
				displayedAction: 'shamana',
				displayedText: 'shamana'
			},
			{
				stepId: 4,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.GOBLIN.name],
					value: 3,
					zone: MapZone.GTOUTCHAUD
				},
				displayedText: 'killGoblin',
				displayedAction: 'killGoblin'
			},
			{
				stepId: 5,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'donga'
				},
				displayedAction: 'donga',
				displayedText: 'donga'
			},
			{
				stepId: 6,
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.GOBLIN.name],
					value: 3,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killGob',
				displayedText: 'killGob'
			},
			{
				stepId: 7,
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'wahhh'
				},
				displayedAction: 'wahhh',
				displayedText: 'wahhh'
			},
			{
				stepId: 8,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rock'
				},
				displayedAction: 'rock',
				displayedText: 'rock'
			},
			{
				stepId: 9,
				place: PlaceEnum.FOSSELAVE,
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
				value: itemList[Item.CLOUD_BURGER].itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.GORGES_PROFONDES,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'hieroglyphes'
				},
				displayedAction: 'hieroglyphes',
				displayedText: 'hieroglyphes'
			},
			{
				stepId: 1,
				place: PlaceEnum.FOSSELAVE,
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
				value: itemList[Item.HOT_BREAD].itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.UNIVERSITE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'profLetter'
				},
				displayedAction: 'profLetter',
				displayedText: 'profLetter'
			},
			{
				stepId: 1,
				place: PlaceEnum.ILE_WAIKIKI,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'yolande'
				},
				displayedText: 'yolande',
				displayedAction: 'yolande'
			},
			{
				stepId: 2,
				place: PlaceEnum.FORCEBRUT,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'foundArcheo'
				},
				displayedAction: 'foundArcheo',
				displayedText: 'foundArcheo'
			},
			{
				stepId: 3,
				place: PlaceEnum.GORGES_PROFONDES,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'archeo'
				},
				displayedAction: 'archeo',
				displayedText: 'archeo'
			},
			{
				stepId: 4,
				place: PlaceEnum.FOSSELAVE,
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
