import { statusList } from "../../dinoz/StatusList.mjs";
import { TriggerEnum, RewardEnum } from "../../enums/Parser.mjs";
import { monsterList } from "../../fight/MonsterList.mjs";
import { NpcData } from "../NpcData.mjs";

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
		nextStep: ['fight', 'run']
	},
	fight: {
		stepName: 'fight',
		nextStep: [],
		action: {
			enemies: [monsterList.KORGON],
			actionType: TriggerEnum.FIGHT
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.LANTERN
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
