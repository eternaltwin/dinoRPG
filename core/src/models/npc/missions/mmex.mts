import { RewardEnum, ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { itemList, Item } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { placeList } from '../../place/PlaceList.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';

export const M_MMEX: Mission[] = [
	// Missions 57 to 61
	{
		missionId: MissionID.MMEX_MMEX1,
		missionName: 'mmex1',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.MMEX_MMEX3 //Did this to block mission
		},
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
		steps: []
	},
	{
		missionId: MissionID.MMEX_MMEX2,
		missionName: 'mmex2',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.MMEX_MMEX3 //Did this to block mission
		},
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.FIGHT_RATION].itemId,
				quantity: 1
			}
		],
		steps: []
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
		steps: []
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
		steps: []
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
		steps: []
	}
];
