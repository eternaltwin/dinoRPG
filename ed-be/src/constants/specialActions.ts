import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum, Operator, RewardEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { bossList } from '@drpg/core/models/fight/BossList';
import { SpecialActions } from '@drpg/core/models/missions/specialActions';
import { placeList } from '@drpg/core/models/place/PlaceList';

export const specialActions: Record<string, SpecialActions> = {
	ENTER_TOWER: {
		place: PlaceEnum.TOUR_SOMBRE_1,
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.SYLVENOIRE_KEY } },
				{ [ConditionEnum.PLACE_IS]: PlaceEnum.TOUR_SOMBRE }
			]
		},
		opponents: [bossList.TOWER_GUARDIAN],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.SYLVENOIRE_KEY
			},
			{
				rewardType: RewardEnum.TELEPORT,
				place: placeList[PlaceEnum.MARAIS_COLLANT]
			}
		]
	}
};
