import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum, Operator, RewardEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { bossList } from '@drpg/core/models/fight/BossList';
import { SpecialActions } from '@drpg/core/models/missions/specialActions';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { Scenario } from '@drpg/core/models/enums/Scenario';
import { Item, itemList } from '@drpg/core/models/item/ItemList';

export const specialActions: Record<string, SpecialActions> = {
	ENTER_TOWER: {
		place: PlaceEnum.TOUR_SOMBRE_1,
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SYLVENOIRE_KEY } },
				{ [ConditionEnum.PLACE_IS]: PlaceEnum.TOUR_SOMBRE }
			]
		},
		opponents: [bossList.TOWER_GUARDIAN],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SYLVENOIRE_KEY
			},
			{
				rewardType: RewardEnum.TELEPORT,
				place: placeList[PlaceEnum.MARAIS_COLLANT]
			}
		]
	},
	MEGA_WOLF: {
		place: PlaceEnum.DINOVILLE,
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 1, '='] },
				{ [ConditionEnum.PLACE_IS]: PlaceEnum.DINOVILLE }
			]
		},
		opponents: [bossList.MEGA_WOLF],
		startText: {
			type: 'announce',
			text: 'fight_megawolf'
		},
		endText: {
			type: 'announce',
			text: 'fight_star_found'
		},

		reward: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.MAGIC_STAR].itemId,
				quantity: 1
			},
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.STAR,
				step: 2
			}
		]
	}
};
