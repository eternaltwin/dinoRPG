import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, Operator, TriggerEnum, RewardEnum } from "../../enums/Parser.mjs";
import { bossList } from "../../fight/BossList.mjs";
import { NpcData } from "../NpcData.mjs";

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
						{ [ConditionEnum.STATUS]: statusList.BUOY },
						{ [ConditionEnum.STATUS]: statusList.CLIMBING_GEAR }
					],
				},
				{ [ConditionEnum.MAXLEVEL]: 6 }
			],
		}
	},
	learn: {
		stepName: 'learn',
		alias: 'back',
		nextStep: ['water', 'fire'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 5 },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.BUOY } },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.CLIMBING_GEAR } }
			],
		}
	},
	learn_water: {
		stepName: 'learn_water',
		nextStep: ['water_fight'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 7 },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.BUOY } },
				{ [ConditionEnum.STATUS]: statusList.CLIMBING_GEAR }
			],
		}
	},
	learn_fire: {
		stepName: 'learn_fire',
		nextStep: ['fire_fight'],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.MINLEVEL]: 7 },
				{ [ConditionEnum.STATUS]: statusList.BUOY },
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: statusList.CLIMBING_GEAR } },
			],
		}
	},
	learn_done: {
		stepName: 'learn_done',
		nextStep: [],
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: statusList.BUOY },
				{ [ConditionEnum.STATUS]: statusList.CLIMBING_GEAR }
			],
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
		nextStep: [],
		action: {
			actionType: TriggerEnum.FIGHT,
			enemies: [bossList.ELEMENTAIRE_EAU]
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.BUOY
			}
		]
	},
	fire_fight: {
		stepName: 'fire_fight',
		nextStep: [],
		action: {
			actionType: TriggerEnum.FIGHT,
			enemies: [bossList.ELEMENTAIRE_FEU]
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.CLIMBING_GEAR
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
			[ConditionEnum.STATUS]: statusList.OLD_STONE
		}
	},
	gant: {
		stepName: 'gant',
		nextStep: ['menu'],
		condition: {
			[ConditionEnum.STATUS]: statusList.ZORS_GLOVE
		}
	},
	stone_yes: {
		stepName: 'stone_yes',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.OLD_STONE,
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.ASHPOUK_TOTEM
			}
		]
	},
	stone_no: {
		stepName: 'stone_no',
		nextStep: ['menu']
	},
	noquestion: {
		stepName: 'noquestion',
		nextStep: []
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
