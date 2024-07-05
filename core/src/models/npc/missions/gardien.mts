import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { PlaceEnum } from '../../enums/PlaceEnum.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';

export const M_GARDIEN: Mission[] = [
	// Missions 37 to 43
	{
		missionId: MissionID.GARDIEN_UNMUTE,
		missionName: 'unmute',
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.PAMPLEBOUM.itemId,
				quantity: 3
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 110
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.FLEUVE_JUMIN,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'fwater'
				},
				displayedAction: 'fwater',
				displayedText: 'fwater'
			},
			{
				stepId: 1,
				place: PlaceEnum.MARAIS_COLLANT,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'mwater'
				},
				displayedAction: 'mwater',
				displayedText: 'mwater'
			},
			{
				stepId: 2,
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pwater'
				},
				displayedAction: 'pwater',
				displayedText: 'pwater'
			},
			{
				stepId: 3,
				place: PlaceEnum.GORGES_PROFONDES,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'bwater'
				},
				displayedAction: 'bwater',
				displayedText: 'bwater'
			},
			{
				stepId: 4,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'racine'
				},
				displayedAction: 'racine',
				displayedText: 'racine'
			},
			{
				stepId: 5,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'garde'
				},
				displayedAction: 'arbre',
				displayedText: 'arbre'
			}
		]
	},
	{
		missionId: MissionID.GARDIEN_ORCHID,
		missionName: 'orchid',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_UNMUTE
		},
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.PAMPLEBOUM.itemId,
				quantity: 1
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.FLEUVE_JUMIN,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickwater'
				},
				displayedAction: 'pickwater',
				displayedText: 'pickwater'
			},
			{
				stepId: 1,
				place: PlaceEnum.AUREE_DE_LA_FORET,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'worchid'
				},
				displayedAction: 'worchid',
				displayedText: 'worchid'
			},
			{
				stepId: 2,
				place: PlaceEnum.AUREE_DE_LA_FORET,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'talkingorchide'
				},
				displayedAction: 'talkingorchide',
				displayedText: 'talkingorchide'
			},
			{
				stepId: 3,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'garde'
				},
				displayedAction: 'arbre',
				displayedText: 'arbre'
			}
		]
	},
	{
		missionId: MissionID.GARDIEN_LICENS,
		missionName: 'licens',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_UNMUTE
		},
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.PAMPLEBOUM.itemId,
				quantity: 3
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 40
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.CHEMIN_GLAUQUE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name, monsterList.RONCIV.name],
					value: 8
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 1,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'garde'
				},
				displayedAction: 'arbre',
				displayedText: 'arbre'
			}
		]
	},
	{
		missionId: MissionID.GARDIEN_KING,
		missionName: 'king',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_UNMUTE },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_ORCHID }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 2500
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 35
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.PAMPLEBOUM.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.COLLINES_HANTEES,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'yell'
				},
				displayedAction: 'yell',
				displayedText: 'yell'
			},
			{
				stepId: 1,
				place: PlaceEnum.AUREE_DE_LA_FORET,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'talkingorchide'
				},
				displayedAction: 'talkingorchide',
				displayedText: 'talkingorchide'
			},
			{
				stepId: 2,
				place: PlaceEnum.AUREE_DE_LA_FORET,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickorchid'
				},
				displayedAction: 'pickorchid',
				displayedText: 'pickorchid'
			},
			{
				stepId: 3,
				place: PlaceEnum.COLLINES_HANTEES,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'plantorchid'
				},
				displayedAction: 'plantorchid',
				displayedText: 'plantorchid'
			},
			{
				stepId: 4,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'garde'
				},
				displayedAction: 'arbre',
				displayedText: 'arbre'
			}
		]
	},
	{
		missionId: MissionID.GARDIEN_WISHES,
		missionName: 'wishes',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_UNMUTE
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 60
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.PAMPLEBOUM.itemId,
				quantity: 4
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.CHUTES_MUTANTES,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'tosscoin'
				},
				displayedAction: 'tosscoin',
				displayedText: 'tosscoin'
			},
			{
				stepId: 1,
				place: PlaceEnum.AUREE_DE_LA_FORET,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name, monsterList.RONCIV.name],
					value: 2
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 2,
				place: PlaceEnum.CHEMIN_GLAUQUE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name, monsterList.RONCIV.name],
					value: 3
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 3,
				place: PlaceEnum.FLEUVE_JUMIN,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name, monsterList.RONCIV.name],
					value: 3
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 4,
				place: PlaceEnum.JUNGLE_SAUVAGE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name, monsterList.RONCIV.name],
					value: 6
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 5,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'garde'
				},
				displayedAction: 'arbre',
				displayedText: 'arbre'
			}
		]
	},
	{
		missionId: MissionID.GARDIEN_NEWPLT,
		missionName: 'newplt',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_UNMUTE
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 75
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.PAMPLEBOUM.itemId,
				quantity: 2
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'benevole'
				},
				displayedAction: 'benevole',
				displayedText: 'benevole1'
			},
			{
				stepId: 1,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY.name],
					value: 3
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 2,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'liftrock'
				},
				displayedAction: 'liftrock',
				displayedText: 'liftrock1'
			},
			{
				stepId: 3,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY.name],
					value: 6
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 4,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'benevole'
				},
				displayedAction: 'benevole',
				displayedText: 'benevole2'
			},
			{
				stepId: 5,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'liftrock'
				},
				displayedAction: 'liftrock',
				displayedText: 'liftrock2'
			},
			{
				stepId: 6,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'benevole'
				},
				displayedAction: 'benevole',
				displayedText: 'benevole3'
			},
			{
				stepId: 7,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'garde'
				},
				displayedAction: 'arbre',
				displayedText: 'arbre'
			}
		]
	},
	{
		missionId: MissionID.GARDIEN_GSHOP,
		missionName: 'gshop',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_UNMUTE },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_ORCHID },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_LICENS },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_KING },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_WISHES },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.GARDIEN_NEWPLT }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 5
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FLOWERING_BRANCH
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'bucket'
				},
				displayedAction: 'bucket',
				displayedText: 'bucket'
			},
			{
				stepId: 1,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'garde'
				},
				displayedAction: 'arbre',
				displayedText: 'arbre'
			}
		]
	}
];
