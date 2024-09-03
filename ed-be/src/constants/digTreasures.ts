import { DigData } from '@drpg/core/models/dinoz/DigData';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum, Operator, RewardEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Scenario } from '@drpg/core/models/enums/Scenario';
import { Item, itemList } from '@drpg/core/models/item/ItemList';

export const digTreasures: Readonly<Record<string, DigData>> = {
	BASALT: {
		name: 'basalt',
		place: PlaceEnum.PENTES_DE_BASALTE,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.BASALT_SHARD
			}
		],
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.BASALT_SHARD } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE } }
			]
		}
	},
	PURE_WATER: {
		name: 'PURE_WATER',
		place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.PURE_WATER
			}
		],
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.PURE_WATER } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE } }
			]
		}
	},
	SWAMP_MUD: {
		name: 'SWAMP_MUD',
		place: PlaceEnum.MARAIS_COLLANT,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SWAMP_MUD
			}
		],
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MUD } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE } }
			]
		}
	},
	OLD_STONE: {
		name: 'OLD_STONE',
		place: PlaceEnum.RUINES_ASHPOUK,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.OLD_STONE
			}
		],
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.OLD_STONE } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ASHPOUK_TOTEM } }
			]
		}
	},
	FOURTH_STAR: {
		name: 'FOURTH_STAR',
		place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.STAR,
				step: 5
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList[Item.MAGIC_STAR].itemId,
				quantity: 1
			}
		],
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.STAR, 4, '=']
		}
	}
};
