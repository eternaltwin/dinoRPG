import { ConditionEnum, RewardEnum } from '../../enums/Parser.mjs';
import { PlaceEnum } from '../../enums/PlaceEnum.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';
import { itemList, Item } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { MapZone } from '../../enums/MapZone.mjs';

export const M_RODEUR: Mission[] = [
	// Missions 49 to 50
	{
		missionId: MissionID.RODEUR_RODRIZ,
		missionName: 'rodriz',
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.AMNESIC_RICE].itemId,
				quantity: 1
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 5000
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rice'
				},
				displayedAction: 'seekrice',
				displayedText: 'seekrice'
			},
			{
				stepId: 1,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.PIRA.name],
					value: 30,
					zone: MapZone.ILES
				},
				displayedAction: 'killPira',
				displayedText: 'killPira'
			},
			{
				stepId: 2,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rice'
				},
				displayedAction: 'pickrice',
				displayedText: 'pickrice'
			},
			{
				stepId: 3,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'forges'
				},
				displayedAction: 'rodeur',
				displayedText: 'rodeur'
			}
		]
	},
	{
		missionId: MissionID.RODEUR_RODLIF,
		missionName: 'rodlif',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 500
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 250
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.CHUTES_MUTANTES,
				requirement: {
					actionType: ConditionEnum.KILL_BOSS,
					target: [bossList.PTEROZ, bossList.HIPPOCLAMP, bossList.ROCKY]
				},
				displayedAction: 'killDark',
				displayedText: 'killDark'
			},
			{
				stepId: 1,
				place: PlaceEnum.FORGES_DU_GTC,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'forges'
				},
				displayedAction: 'rodeur',
				displayedText: 'rodeur'
			}
		]
	}
];
