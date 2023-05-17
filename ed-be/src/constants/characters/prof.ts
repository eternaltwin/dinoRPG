import { ConditionEnum, ConditionOperatorEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { NpcData } from '@drpg/core/models/npc/NpcData';

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
			conditionType: ConditionEnum.MAXLEVEL,
			value: 5
		}
	},
	nothing2: {
		stepName: 'nothing2',
		nextStep: [],
		condition: {
			conditionType: ConditionEnum.MAXLEVEL,
			value: 7,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'buoy',
				operator: ConditionOperatorEnum.OR,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'CLIMBING_GEAR'
				}
			}
		}
	},
	learn: {
		stepName: 'learn',
		alias: 'back',
		nextStep: ['water', 'fire'],
		condition: {
			conditionType: ConditionEnum.MINLEVEL,
			value: 5,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'buoy',
				reverse: true,
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'CLIMBING_GEAR',
					reverse: true
				}
			}
		}
	},
	learn_water: {
		stepName: 'learn_water',
		nextStep: ['water_fight'],
		condition: {
			conditionType: ConditionEnum.MINLEVEL,
			value: 7,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'buoy',
				reverse: true,
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'CLIMBING_GEAR'
				}
			}
		}
	},
	learn_fire: {
		stepName: 'learn_fire',
		nextStep: ['fire_fight'],
		condition: {
			conditionType: ConditionEnum.MINLEVEL,
			value: 7,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'buoy',
				operator: ConditionOperatorEnum.AND,
				nextCondition: {
					conditionType: ConditionEnum.STATUS,
					value: 'CLIMBING_GEAR',
					reverse: true
				}
			}
		}
	},
	learn_done: {
		stepName: 'learn_done',
		nextStep: [],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'buoy',
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.STATUS,
				value: 'climbing_gear'
			}
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
		action: 'fight(ewater)',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'buoy'
			}
		]
	},
	fire_fight: {
		stepName: 'fire_fight',
		nextStep: [],
		action: 'fight(efire)',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'climbing_gear'
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
			conditionType: ConditionEnum.MINLEVEL,
			value: 7
		}
	},
	atlante: {
		stepName: 'atlante',
		nextStep: ['menu'],
		condition: {
			conditionType: ConditionEnum.MINLEVEL,
			value: 8
		}
	},
	stone: {
		stepName: 'stone',
		nextStep: ['stone_yes', 'stone_no'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'old_stone'
		}
	},
	gant: {
		stepName: 'gant',
		nextStep: ['menu'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'zors_glove'
		}
	},
	stone_yes: {
		stepName: 'stone_yes',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'old_stone',
				reverse: true
			},
			{
				rewardType: RewardEnum.STATUS,
				value: 'ashpouk_totem'
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
