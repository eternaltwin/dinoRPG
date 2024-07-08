import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { NpcData } from '../NpcData.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';
import { Reward } from '../../reward/RewardList.mjs';

export const VENERABLE: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['moi', 'moi2', 'bye'],
		initialStep: true
	},
	moi: {
		stepName: 'moi',
		nextStep: ['perdu', 'chasse', 'deal', 'korgon', 'auto'],
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.VMEM }
		}
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [bossList.VENERABLE],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.VENERABLE
		},
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.VENER
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.VENERABLE
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.VMEM
			},
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.FIGHT]
			}
		]
	},
	perdu: {
		stepName: 'perdu',
		nextStep: [],
		target: 'fight'
	},
	chasse: {
		stepName: 'chasse',
		nextStep: [],
		target: 'fight'
	},
	deal: {
		stepName: 'deal',
		nextStep: [],
		target: 'fight'
	},
	auto: {
		stepName: 'auto',
		nextStep: [],
		target: 'fight'
	},
	korgon: {
		stepName: 'korgon',
		nextStep: ['next0', 'next1']
	},
	next0: {
		stepName: 'next0',
		nextStep: [],
		target: 'fight'
	},
	next1: {
		stepName: 'next1',
		nextStep: ['next2'],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.VMEM
			}
		]
	},
	next2: {
		stepName: 'next2',
		nextStep: [],
		target: 'question'
	},
	question: {
		stepName: 'question',
		nextStep: ['force', 'fight', 'fight2']
	},
	moi2: {
		stepName: 'moi2',
		nextStep: ['question'],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.VMEM
		}
	},
	fight2: {
		stepName: 'fight2',
		nextStep: [],
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.VENERABLE }
		}
	},
	force: {
		stepName: 'force',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FFLAG
			}
		]
	},
	fight_win: {
		stepName: 'fight_win',
		nextStep: []
	},
	bye: {
		stepName: 'bye',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
