import { Mission } from '@drpg/core/models/missions/mission';
import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { missionsList } from '../missions.js';
import { placeList } from '../place.js';
import { itemList } from '../item.js';
import { statusList } from '../status.js';

export const M_GARDIEN: Array<Mission> = [
	// Missions 37 to 43
	{
		missionId: missionsList.GARDIEN_UNMUTE,
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
				place: placeList.FLEUVE_JUMIN.name,
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
				place: placeList.MARAIS_COLLANT.name,
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
				place: placeList.FOUTAINE_DE_JOUVENCE.name,
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
				place: placeList.GORGES_PROFONDES.name,
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
				place: placeList.PORTE_DE_SYLVENOIRE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'racine'
				},
				displayedAction: 'racine',
				displayedText: 'racine'
			},
			{
				stepId: 5,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
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
		missionId: missionsList.GARDIEN_ORCHID,
		missionName: 'orchid',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: missionsList.GARDIEN_UNMUTE
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
				place: placeList.FLEUVE_JUMIN.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickwater'
				},
				displayedAction: 'pickwater',
				displayedText: 'pickwater'
			},
			{
				stepId: 1,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'worchid'
				},
				displayedAction: 'worchid',
				displayedText: 'worchid'
			},
			{
				stepId: 2,
				place: placeList.CAMP_KORGON.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'talkingorchide'
				},
				displayedAction: 'orchid',
				displayedText: 'orchid'
			},
			{
				stepId: 3,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
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
		missionId: missionsList.GARDIEN_LICENS,
		missionName: 'licens',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: missionsList.GARDIEN_UNMUTE
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
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'korgon:ronciv',
					value: 8
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 1,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
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
		missionId: missionsList.GARDIEN_KING,
		missionName: 'king',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: missionsList.GARDIEN_UNMUTE,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.FINISHED_MISSION,
				value: missionsList.GARDIEN_ORCHID
			}
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
				place: placeList.COLLINES_HANTEES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'yell'
				},
				displayedAction: 'yell',
				displayedText: 'yell'
			},
			{
				stepId: 1,
				place: placeList.AUREE_DE_LA_FORET.name,
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
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickorchid'
				},
				displayedAction: 'pickorchid',
				displayedText: 'pickorchid'
			},
			{
				stepId: 3,
				place: placeList.COLLINES_HANTEES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'plantorchid'
				},
				displayedAction: 'plantorchid',
				displayedText: 'plantorchid'
			},
			{
				stepId: 4,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
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
		missionId: missionsList.GARDIEN_WISHES,
		missionName: 'wishes',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: missionsList.GARDIEN_UNMUTE
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
				place: placeList.CHUTES_MUTANTES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'tosscoin'
				},
				displayedAction: 'tosscoin',
				displayedText: 'tosscoin'
			},
			{
				stepId: 1,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'korgon:ronciv',
					value: 2
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 2,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'korgon:ronciv',
					value: 3
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 3,
				place: placeList.FLEUVE_JUMIN.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'korgon:ronciv',
					value: 3
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 4,
				place: placeList.JUNGLE_SAUVAGE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'korgon:ronciv',
					value: 6
				},
				displayedAction: 'killKorRonc',
				displayedText: 'killKorRonc'
			},
			{
				stepId: 5,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
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
		missionId: missionsList.GARDIEN_NEWPLT,
		missionName: 'newplt',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: missionsList.GARDIEN_UNMUTE
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
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'benevole'
				},
				displayedAction: 'benevole',
				displayedText: 'benevole1'
			},
			{
				stepId: 1,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'any',
					value: 3
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 2,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'liftrock'
				},
				displayedAction: 'liftrock',
				displayedText: 'liftrock1'
			},
			{
				stepId: 3,
				place: placeList.RUINES_ASHPOUK.name,
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
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'benevole'
				},
				displayedAction: 'benevole',
				displayedText: 'benevole2'
			},
			{
				stepId: 5,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'liftrock'
				},
				displayedAction: 'liftrock',
				displayedText: 'liftrock2'
			},
			{
				stepId: 6,
				place: placeList.RUINES_ASHPOUK.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'benevole'
				},
				displayedAction: 'benevole',
				displayedText: 'benevole3'
			},
			{
				stepId: 7,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
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
		missionId: missionsList.GARDIEN_GSHOP,
		missionName: 'shop',
		condition: {
			conditionType: ConditionEnum.FINISHED_MISSION,
			value: missionsList.GARDIEN_UNMUTE,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.FINISHED_MISSION,
				value: missionsList.GARDIEN_ORCHID,
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.FINISHED_MISSION,
					value: missionsList.GARDIEN_LICENS,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.FINISHED_MISSION,
						value: missionsList.GARDIEN_KING,
						operator: ConditionOperatorEnum.AND,
						nextCondition: {
							conditionType: ConditionEnum.FINISHED_MISSION,
							value: missionsList.GARDIEN_WISHES,
							operator: ConditionOperatorEnum.AND,
							nextCondition: {
								conditionType: ConditionEnum.FINISHED_MISSION,
								value: missionsList.GARDIEN_NEWPLT
							}
						}
					}
				}
			}
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 5
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.FLOWERING_BRANCH
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'bucket'
				},
				displayedAction: 'bucket',
				displayedText: 'bucket'
			},
			{
				stepId: 1,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
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
