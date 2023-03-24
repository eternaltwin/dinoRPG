import { placeList } from './place.js';
import { ConditionEnum, ConditionOperatorEnum, DigData, RewardEnum } from '../models/index.js';

export const digTreasures: Readonly<Record<string, DigData>> = {
	BASALT: {
		name: 'basalt',
		place: placeList.PENTES_DE_BASALTE.placeId,
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'BASALT_SHARD'
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'BASALT_SHARD',
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'ZORS_GLOVE',
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
				value: 'PURE_WATER'
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'PURE_WATER',
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'ZORS_GLOVE',
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
				value: 'SWAMP_MUD'
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'SWAMP_MUD',
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'ZORS_GLOVE',
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
				value: 'OLD_STONE'
			}
		],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'OLD_STONE',
			reverse: true,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'ASHPOUK_TOTEM',
				reverse: true
			}
		}
	}
};
