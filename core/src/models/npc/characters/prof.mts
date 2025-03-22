import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { bossList } from '../../fight/BossList.mjs';
import { NpcData } from '../NpcData.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

export const PROFESSOR: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		nextStep: ['question', 'nothing', 'nothing2', 'learn', 'learn_water', 'learn_fire', 'learn_done']
	},
	nothing: {
		stepName: 'nothing',
		nextStep: [],
		condition: {
			[ConditionEnum.MAXLEVEL]: 4
		}
	},
	nothing2: {
		stepName: 'nothing2',
		nextStep: [],
		condition: {
			[Operator.AND]: [
				{
					[Operator.OR]: [
						{ [ConditionEnum.STATUS]: DinozStatusId.BUOY },
						{ [ConditionEnum.STATUS]: DinozStatusId.CLIMBING_GEAR }
					]
				},
				{ [ConditionEnum.MAXLEVEL]: 6 }
			]
		}
	},
	learn: {
		stepName: 'learn',
		alias: 'back',
		nextStep: ['water', 'fire'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 5 },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.BUOY } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.CLIMBING_GEAR } }
			]
		}
	},
	learn_water: {
		stepName: 'learn_water',
		nextStep: ['water_fight'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 7 },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.BUOY } },
				{ [ConditionEnum.STATUS]: DinozStatusId.CLIMBING_GEAR }
			]
		}
	},
	learn_fire: {
		stepName: 'learn_fire',
		nextStep: ['fire_fight'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 7 },
				{ [ConditionEnum.STATUS]: DinozStatusId.BUOY },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.CLIMBING_GEAR } }
			]
		}
	},
	learn_done: {
		stepName: 'learn_done',
		nextStep: [],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.BUOY },
				{ [ConditionEnum.STATUS]: DinozStatusId.CLIMBING_GEAR }
			]
		}
	},
	water: {
		stepName: 'water',
		nextStep: ['water_fight', 'back']
	},
	fire: {
		stepName: 'fire',
		nextStep: ['fire_fight', 'back']
	},
	water_fight: {
		stepName: 'water_fight',
		nextStep: ['water_win'],
		fight: [bossList.ELEMENTAIRE_EAU],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.BUOY
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN
			},
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.FIGHT]
			}
		]
	},
	fire_fight: {
		stepName: 'fire_fight',
		nextStep: ['fire_win'],
		fight: [bossList.ELEMENTAIRE_FEU],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.CLIMBING_GEAR
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FRETURN
			},
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.FIGHT]
			}
		]
	},
	question: {
		stepName: 'question',
		alias: 'menu',
		nextStep: ['dinoville', 'gtc', 'atlante', 'stone', 'gant', 'noquestion']
	},
	dinoville: {
		stepName: 'dinoville',
		nextStep: ['menu']
	},
	gtc: {
		stepName: 'gtc',
		nextStep: ['menu'],
		condition: {
			[ConditionEnum.MINLEVEL]: 7
		}
	},
	atlante: {
		stepName: 'atlante',
		nextStep: ['menu'],
		condition: {
			[ConditionEnum.MINLEVEL]: 8
		}
	},
	stone: {
		stepName: 'stone',
		nextStep: ['stone_yes', 'stone_no'],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.OLD_STONE
		}
	},
	gant: {
		stepName: 'gant',
		nextStep: ['menu'],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE
		}
	},
	stone_yes: {
		stepName: 'stone_yes',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.OLD_STONE,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.ASHPOUK_TOTEM
			}
		]
	},
	stone_no: {
		stepName: 'stone_no',
		target: 'question',
		nextStep: ['menu']
	},
	noquestion: {
		stepName: 'noquestion',
		nextStep: []
	},
	fire_win: {
		stepName: 'fire_win',
		nextStep: [],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.FRETURN
		}
	},
	water_win: {
		stepName: 'water_win',
		nextStep: [],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.FRETURN
		}
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
