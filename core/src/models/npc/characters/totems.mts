import { RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { rewardList } from '../../reward/RewardList.mjs';
import { DinozStatusId } from '../../dinoz/StatusList.mjs';

export const PTEROZ: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['fight', 'leave'],
		initialStep: true
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [bossList.PTEROZ],
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: rewardList.PTEROZ
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN
			}
		]
	},
	leave: {
		stepName: 'leave',
		nextStep: []
	},
	fight_win: {
		stepName: 'fight_win',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN,
				reverse: true
			}
		],
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const HIPPO: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['fight', 'leave'],
		initialStep: true
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [bossList.HIPPOCLAMP],
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: rewardList.HIPPO
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN
			}
		]
	},
	leave: {
		stepName: 'leave',
		nextStep: []
	},
	fight_win: {
		stepName: 'fight_win',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN,
				reverse: true
			}
		],
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const ROCKY: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['fight', 'leave', 'touch', 'grave'],
		initialStep: true
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [bossList.ROCKY],
		alias: 'grave',
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: rewardList.PTEROZ
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN
			}
		]
	},
	leave: {
		stepName: 'leave',
		nextStep: []
	},
	touch: {
		stepName: 'touch',
		nextStep: []
	},
	grave: {
		stepName: 'grave',
		nextStep: [],
		target: 'fight'
	},
	fight_win: {
		stepName: 'fight_win',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN,
				reverse: true
			}
		],
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
