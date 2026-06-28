import { DigData } from '@drpg/core/models/dinoz/DigData';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum, Operator, RewardEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Scenario } from '@drpg/core/models/enums/Scenario';
import { bossList } from '@drpg/core/models/fight/BossList';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { SWAMP_FLOODED_DAYS, SWAMP_FOG_DAYS } from '@drpg/core/models/place/PlaceList';

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
	},
	SWAMP_MONSTER_FLOODED: {
		name: 'SWAMP_MONSTER_FLOODED',
		place: PlaceEnum.MARAIS_COLLANT,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SWAMP_BUOY
			}
		],
		fight: [bossList.SWAMP_MONSTER_FLOODED],
		condition: {
			[Operator.AND]: [
				// Doesn't have the buoy yet
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SWAMP_BUOY } },
				// Know about swamp monsters
				{ [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MONSTERS_KNOWN },
				// Can use the power of the Zors glove
				{ [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE },
				// Flooded day
				{
					[Operator.OR]: SWAMP_FLOODED_DAYS.map(day => ({ [ConditionEnum.DAY]: day })) as [
						Condition,
						Condition,
						...Condition[]
					]
				},
				// Have the Mud or the Glove
				{
					[Operator.OR]: [
						{ [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MUD },
						{ [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE }
					]
				},
				// 10% chance to encounter
				{ [ConditionEnum.RANDOM]: 10 }
			]
		}
	},
	SWAMP_MONSTER_FOG: {
		name: 'SWAMP_MONSTER_FOG',
		place: PlaceEnum.MARAIS_COLLANT,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SWAMP_LANTERN
			}
		],
		fight: [bossList.SWAMP_MONSTER_FOG],
		condition: {
			[Operator.AND]: [
				// Doesn't have the lantern yet
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SWAMP_LANTERN } },
				// Know about swamp monsters
				{ [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MONSTERS_KNOWN },
				// Can use the power of the Zors glove
				{ [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE },
				// Fog day
				{
					[Operator.OR]: SWAMP_FOG_DAYS.map(day => ({ [ConditionEnum.DAY]: day })) as [
						Condition,
						Condition,
						...Condition[]
					]
				},
				// Have the Mud or the Glove
				{
					[Operator.OR]: [
						{ [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MUD },
						{ [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE }
					]
				},
				// 10% chance to encounter
				{ [ConditionEnum.RANDOM]: 10 }
			]
		}
	}
};
