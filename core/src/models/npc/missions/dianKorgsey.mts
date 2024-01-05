import { statusList } from '../../dinoz/StatusList.mjs';
import { RewardEnum, ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { placeList } from '../../place/PlaceList.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';

export const M_DIANKORGSEY: Mission[] = [
	// Missions 22 to 25
	{
		missionId: MissionID.DIAN_KSWIM,
		missionName: 'kswim',
		rewards: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.FLIPPERS
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.CAMP_KORGON.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'list'
				},
				displayedAction: 'list',
				displayedText: 'list'
			},
			{
				stepId: 1,
				place: placeList.FORGES_DU_GTC.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'tools'
				},
				displayedAction: 'tools',
				displayedText: 'tools'
			},
			{
				stepId: 2,
				place: placeList.RUINES_ASHPOUK.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'wood'
				},
				displayedAction: 'wood',
				displayedText: 'wood'
			},
			{
				stepId: 3,
				place: placeList.FOSSELAVE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'grigri'
				},
				displayedAction: 'grigri',
				displayedText: 'grigri'
			},
			{
				stepId: 4,
				place: placeList.CAMP_KORGON.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'camp'
				},
				displayedAction: 'dian',
				displayedText: 'dian'
			}
		]
	},
	{
		missionId: MissionID.DIAN_RIVALS,
		missionName: 'rivals',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.DIAN_KSWIM
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 2000
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
					target: [monsterList.KORGON],
					value: 10
				},
				displayedAction: 'kill_south_korgon',
				displayedText: 'kill_south_korgon'
			},
			{
				stepId: 1,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'trophee'
				},
				displayedAction: 'trophee',
				displayedText: 'trophee'
			},
			{
				stepId: 2,
				place: placeList.CAMP_KORGON.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'camp'
				},
				displayedAction: 'dian',
				displayedText: 'dian'
			}
		]
	},
	{
		missionId: MissionID.DIAN_KFOOD,
		missionName: 'kfood',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.DIAN_KSWIM
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 2000
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 40
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'tree'
				},
				displayedAction: 'tree',
				displayedText: 'tree'
			},
			{
				stepId: 1,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY],
					value: 6
				},
				displayedAction: 'killany',
				displayedText: 'killany'
			},
			{
				stepId: 2,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'branch'
				},
				displayedAction: 'branch',
				displayedText: 'branch'
			},
			{
				stepId: 3,
				place: placeList.CAMP_KORGON.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'camp'
				},
				displayedAction: 'dian',
				displayedText: 'dian'
			}
		]
	},
	{
		missionId: MissionID.DIAN_POISON,
		missionName: 'poison',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.DIAN_KFOOD },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.DIAN_RIVALS }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 3500
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 100
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
				place: placeList.COLLINES_HANTEES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'seve'
				},
				displayedAction: 'seve',
				displayedText: 'seve'
			},
			{
				stepId: 1,
				place: placeList.PORTE_DE_SYLVENOIRE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'trap'
				},
				displayedAction: 'trap',
				displayedText: 'trap'
			},
			{
				stepId: 2,
				place: placeList.JUNGLE_SAUVAGE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'ambush'
				},
				displayedAction: 'ambush',
				displayedText: 'ambush'
			},
			{
				stepId: 3,
				place: placeList.JUNGLE_SAUVAGE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON],
					value: 3
				},
				displayedAction: 'killambush_korgons',
				displayedText: 'killambush_korgons'
			},
			{
				stepId: 4,
				place: placeList.FLEUVE_JUMIN.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'leaves'
				},
				displayedAction: 'leaves',
				displayedText: 'leaves1'
			},
			{
				stepId: 5,
				place: placeList.CHEMIN_GLAUQUE.name,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'leaves'
				},
				displayedAction: 'leaves',
				displayedText: 'leaves2'
			},
			{
				stepId: 6,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON, monsterList.RONCIV],
					value: 8
				},
				displayedAction: 'killalliedK',
				displayedText: 'killalliedK'
			},
			{
				stepId: 7,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'fiquoia'
				},
				displayedAction: 'fiquoia',
				displayedText: 'fiquoia'
			},
			{
				stepId: 8,
				place: placeList.FLEUVE_JUMIN.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'dian'
				},
				displayedAction: 'dian',
				displayedText: 'dian'
			},
			{
				stepId: 9,
				place: placeList.FLEUVE_JUMIN.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'hide'
				},
				displayedAction: 'hidefiquoia',
				displayedText: 'hidefiquoia'
			},
			{
				stepId: 10,
				place: placeList.CAMP_KORGON.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'camp'
				},
				displayedAction: 'dian',
				displayedText: 'dian'
			}
		]
	}
];
