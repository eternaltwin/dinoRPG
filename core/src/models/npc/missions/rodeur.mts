import { RewardEnum, ConditionEnum } from '../../enums/Parser.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { placeList } from '../../place/PlaceList.mjs';
import { bossList } from '../../fight/BossList.mjs';

export const M_RODEUR: Array<Mission> = [
	// Missions 49 to 50
	{
		missionId: MissionID.RODEUR_RODRIZ,
		missionName: 'rodriz',
		rewards: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.AMNESIC_RICE.itemId,
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
				place: placeList.MARAIS_COLLANT.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rice'
				},
				displayedAction: 'seekrice',
				displayedText: 'seekrice'
			},
			{
				stepId: 1,
				place: placeList.MARAIS_COLLANT.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'pira',
					value: 30
				},
				displayedAction: 'killPira',
				displayedText: 'killPira'
			},
			{
				stepId: 2,
				place: placeList.MARAIS_COLLANT.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'rice'
				},
				displayedAction: 'pickrice',
				displayedText: 'pickrice'
			},
			{
				stepId: 3,
				place: placeList.FORGES_DU_GTC.name,
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
				place: placeList.CHUTES_MUTANTES.name,
				requirement: {
					actionType: ConditionEnum.KILL_BOSS,
					target: [bossList.PTEROZ, bossList.HIPPOCLAMP, bossList.ROCKY]
				},
				displayedAction: 'killDark',
				displayedText: 'killDark'
			},
			{
				stepId: 1,
				place: placeList.FORGES_DU_GTC.name,
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
