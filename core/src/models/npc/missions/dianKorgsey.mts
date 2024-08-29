import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { PlaceEnum } from '../../enums/PlaceEnum.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { MapZone } from '../../enums/MapZone.mjs';

export const M_DIANKORGSEY: Mission[] = [
	// Missions 22 to 25
	{
		missionId: MissionID.DIAN_KSWIM,
		missionName: 'kswim',
		rewards: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FLIPPERS
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.CAMP_KORGON,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'list'
				},
				displayedAction: 'list',
				displayedText: 'list'
			},
			{
				stepId: 1,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'tools'
				},
				displayedAction: 'tools',
				displayedText: 'tools'
			},
			{
				stepId: 2,
				place: PlaceEnum.RUINES_ASHPOUK,
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
				place: PlaceEnum.FOSSELAVE,
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
				place: PlaceEnum.CAMP_KORGON,
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
				place: PlaceEnum.CHEMIN_GLAUQUE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name],
					value: 10,
					zone: MapZone.JUNGLE
				},
				displayedAction: 'kill_south_korgon',
				displayedText: 'kill_south_korgon'
			},
			{
				stepId: 1,
				place: PlaceEnum.CHEMIN_GLAUQUE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'trophee'
				},
				displayedAction: 'trophee',
				displayedText: 'trophee'
			},
			{
				stepId: 2,
				place: PlaceEnum.CAMP_KORGON,
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
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
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
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.ANY.name],
					value: 6,
					zone: MapZone.JUNGLE
				},
				displayedAction: 'killany',
				displayedText: 'killany'
			},
			{
				stepId: 2,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'branch'
				},
				displayedAction: 'branch',
				displayedText: 'branch'
			},
			{
				stepId: 3,
				place: PlaceEnum.CAMP_KORGON,
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
				place: PlaceEnum.COLLINES_HANTEES,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'seve'
				},
				displayedAction: 'seve',
				displayedText: 'seve'
			},
			{
				stepId: 1,
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'trap'
				},
				displayedAction: 'trap',
				displayedText: 'trap'
			},
			{
				stepId: 2,
				place: PlaceEnum.JUNGLE_SAUVAGE,
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
				place: PlaceEnum.JUNGLE_SAUVAGE,
				hidePlace: true,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name],
					value: 3,
					zone: MapZone.JUNGLE
				},
				displayedAction: 'killambush_korgons',
				displayedText: 'killambush_korgons'
			},
			{
				stepId: 4,
				place: PlaceEnum.FLEUVE_JUMIN,
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
				place: PlaceEnum.CHEMIN_GLAUQUE,
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
				place: PlaceEnum.CHEMIN_GLAUQUE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.KORGON.name, monsterList.RONCIV.name],
					value: 8,
					zone: MapZone.JUNGLE
				},
				displayedAction: 'killalliedK',
				displayedText: 'killalliedK'
			},
			{
				stepId: 7,
				place: PlaceEnum.CHEMIN_GLAUQUE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'fiquoia'
				},
				displayedAction: 'fiquoia',
				displayedText: 'fiquoia'
			},
			{
				stepId: 8,
				place: PlaceEnum.FLEUVE_JUMIN,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'dian'
				},
				displayedAction: 'dian',
				displayedText: 'dian'
			},
			{
				stepId: 9,
				place: PlaceEnum.FLEUVE_JUMIN,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'hide'
				},
				displayedAction: 'hidefiquoia',
				displayedText: 'hidefiquoia'
			},
			{
				stepId: 10,
				place: PlaceEnum.CAMP_KORGON,
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
