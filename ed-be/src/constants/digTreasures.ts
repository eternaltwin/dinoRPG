import { DigData } from '@drpg/core/models/dinoz/DigData';
import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum, Operator, RewardEnum } from '@drpg/core/models/enums/Parser';
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
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.BASALT_SHARD } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.ZORS_GLOVE } }
			]
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
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.PURE_WATER } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.ZORS_GLOVE } }
			]
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
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.SWAMP_MUD } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.ZORS_GLOVE } }
			]
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
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.OLD_STONE } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.ASHPOUK_TOTEM } }
			]
		}
	}
};
