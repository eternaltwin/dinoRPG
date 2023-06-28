import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { itemList } from '../item.js';

export const MERGUEZ: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['ah'],
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
