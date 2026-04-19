import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { RewardEnum, ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';
import { NpcData } from '../NpcData.mjs';

export const FOU: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['hi', 'approch', 'ignore'],
		initialStep: true
	},
	hi: {
		stepName: 'hi',
		nextStep: ['approch', 'ignore', 'run']
	},
	approch: {
		stepName: 'approch',
		nextStep: ['hi', 'ignore', 'run']
	},
	run: {
		stepName: 'run',
		nextStep: []
	},
	ignore: {
		stepName: 'ignore',
		nextStep: ['intro', 'run']
	},
	intro: {
		stepName: 'intro',
		nextStep: ['seenWhat', 'leave']
	},
	seenWhat: {
		stepName: 'seenWhat',
		nextStep: ['show', 'run']
	},
	leave: {
		stepName: 'leave',
		nextStep: []
	},
	show: {
		stepName: 'show',
		nextStep: ['fight', 'run', 'lowLevel']
	},
	fight: {
		stepName: 'fight',
		nextStep: ['fight_win'],
		fight: [monsterList.KORGON],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 18 },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.LANTERN } }
			]
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.LANTERN
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN
			}
		]
	},
	lowLevel: {
		stepName: 'lowLevel',
		nextStep: [],
		condition: {
			[ConditionEnum.MAXLEVEL]: 17
		}
	},
	fight_win: {
		stepName: 'fight_win',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
