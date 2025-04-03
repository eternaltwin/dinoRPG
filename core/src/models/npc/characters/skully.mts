import { Comparator, RewardEnum } from '../../enums/Parser.mjs';
import { itemList, Item } from '../../item/ItemList.mjs';
import { NpcData } from '../NpcData.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { Reward } from '../../reward/RewardList.mjs';

export const SKULLY1: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['arg', 'shortcut', 'bye'],
		initialStep: true
	},
	shortcut: {
		stepName: 'shortcut',
		nextStep: ['missions'],
		condition: {
			[ConditionEnum.ACTIVE]: false //skip dialogue for dev
		}
	},
	arg: {
		stepName: 'arg',
		nextStep: ['arg2', 'bye']
	},
	arg2: {
		stepName: 'arg2',
		nextStep: ['diff', 'bye']
	},
	diff: {
		stepName: 'diff',
		nextStep: ['free', 'bye']
	},
	free: {
		stepName: 'free',
		nextStep: ['haunt', 'bye']
	},
	haunt: {
		stepName: 'haunt',
		nextStep: ['do', 'bye']
	},
	do: {
		stepName: 'do',
		nextStep: ['uhm', 'bye']
	},
	uhm: {
		stepName: 'uhm',
		nextStep: ['bonne', 'bye']
	},
	bonne: {
		stepName: 'bonne',
		nextStep: ['reset', 'next', 'bye']
	},
	reset: {
		stepName: 'reset',
		nextStep: [],
		alias: 'forgot',
		target: 'forgot'
	},
	next: {
		stepName: 'next',
		nextStep: ['help', 'nohelp', 'bye']
	},
	nohelp: {
		stepName: 'nohelp',
		nextStep: ['forgot']
	},
	forgot: {
		stepName: 'forgot',
		nextStep: []
	},
	help: {
		stepName: 'help',
		nextStep: ['question', 'accept', 'maybe']
	},
	question: {
		stepName: 'question',
		nextStep: [],
		alias: 'forgot',
		target: 'forgot'
	},
	maybe: {
		stepName: 'maybe',
		nextStep: [],
		alias: 'forgot',
		target: 'forgot'
	},
	accept: {
		stepName: 'accept',
		nextStep: ['missions']
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

export const SKULLY2: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['missions'],
		initialStep: true
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};

export const SKULLY3: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['pda', 'dinoz'],
		initialStep: true
	},
	pda: {
		stepName: 'pda',
		condition: {
			[Operator.AND]: [
				{
					[Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.PDA }
				},
				{ [ConditionEnum.DINOZ_COUNT]: [Comparator.GREATER_EQUAL, 15] }
			]
		},
		reward: [
			{
				rewardType: RewardEnum.EPIC,
				value: Reward.PDA
			}
		],
		nextStep: []
	},
	dinoz: {
		stepName: 'dinoz',
		condition: {
			[Operator.AND]: [
				{
					[Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.PDA }
				},
				{ [ConditionEnum.DINOZ_COUNT]: [Comparator.LESSER, 15] }
			]
		},
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
				value: itemList[Item.MAGIC_STAR].itemId,
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

export const MOULDEUR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['you'],
		initialStep: true
	},
	you: {
		stepName: 'you',
		nextStep: ['explain']
	},
	explain: {
		stepName: 'explain',
		nextStep: ['other']
	},
	other: {
		stepName: 'other',
		nextStep: ['ok']
	},
	ok: {
		stepName: 'ok',
		nextStep: ['ok2']
	},
	ok2: {
		stepName: 'ok2',
		nextStep: ['skully']
	},
	skully: {
		stepName: 'skully',
		nextStep: ['exp']
	},
	exp: {
		stepName: 'exp',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
