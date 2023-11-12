import { DigData } from '@drpg/core/models/dinoz/DigData';
import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { placeList } from '@drpg/core/models/place/PlaceList';

export const digTreasures: Readonly<Record<string, DigData>> = {
	BASALT: {
		name: 'basalt',
		place: placeList.PENTES_DE_BASALTE.placeId,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.BASALT_SHARD
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.BASALT_SHARD,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.ZORS_GLOVE,
				reverse: true
			}
		}
	},
	PURE_WATER: {
		name: 'PURE_WATER',
		place: placeList.FOUTAINE_DE_JOUVENCE.placeId,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.PURE_WATER
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.PURE_WATER,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.ZORS_GLOVE,
				reverse: true
			}
		}
	},
	SWAMP_MUD: {
		name: 'SWAMP_MUD',
		place: placeList.MARAIS_COLLANT.placeId,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.SWAMP_MUD
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.SWAMP_MUD,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.ZORS_GLOVE,
				reverse: true
			}
		}
	},
	OLD_STONE: {
		name: 'OLD_STONE',
		place: placeList.RUINES_ASHPOUK.placeId,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.OLD_STONE
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.OLD_STONE,
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: statusList.ASHPOUK_TOTEM,
				reverse: true
			}
		}
	}
};
