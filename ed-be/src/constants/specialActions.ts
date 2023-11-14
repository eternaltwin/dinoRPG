import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum, Operator, RewardEnum } from '@drpg/core/models/enums/Parser';
import { bossList } from '@drpg/core/models/fight/BossList';
import { SpecialActions } from '@drpg/core/models/missions/specialActions';
import { placeList } from '@drpg/core/models/place/PlaceList';

export const specialActions: Record<string, SpecialActions> = {
	ENTER_TOWER: {
		place: placeList.TOUR_SOMBRE_1.placeId,
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.SYLVENOIRE_KEY } },
				{ [ConditionEnum.PLACE_IS]: placeList.TOUR_SOMBRE.name }
			]
		},
		opponents: [bossList.GARDIEN_TOUR],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.SYLVENOIRE_KEY
			},
			{
				rewardType: RewardEnum.TELEPORT,
				place: placeList.MARAIS_COLLANT
			}
		]
	}
};
