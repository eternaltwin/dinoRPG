import { placeList } from './place.js';
import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { statusList } from './status.js';
import { SpecialActions } from '@drpg/core/models/missions/specialActions';
import { bossList } from './boss.js';

export const specialActions: Record<string, SpecialActions> = {
	ENTER_TOWER: {
		place: placeList.TOUR_SOMBRE_1.placeId,
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.SYLVENOIRE_KEY,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.PLACE_IS,
				value: placeList.TOUR_SOMBRE.name
			}
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
