import { RewardEnum } from '../../enums/Parser.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { NpcData } from '../NpcData.mjs';
import { Scenario } from '../../enums/Scenario.mjs';

export const SKULLY: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: [],
		initialStep: true
	},
	ah: {
		stepName: 'ah',
		nextStep: ['ok']
	},
	ok: {
		stepName: 'ok',
		reward: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.GOBLIN_MERGUEZ.itemId,
				quantity: 5
			}
		],
		nextStep: ['thanks']
	},
	thanks: {
		stepName: 'thanks',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const SKULLY_STAR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['ok'],
		initialStep: true
	},
	ok: {
		stepName: 'ok',
		nextStep: ['star']
	},
	star: {
		stepName: 'star',
		reward: [
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.MAGIC_STAR.itemId,
				quantity: 1
			},
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.STAR,
				step: 6
			}
		],
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
