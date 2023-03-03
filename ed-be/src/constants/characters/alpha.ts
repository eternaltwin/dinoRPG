import { ConditionEnum, ElementType, NpcData, RewardEnum } from '../../models/index.js';

export const ALPHA: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		alias: 'back',
		nextStep: ['element', 'world', 'experience']
	},
	element: {
		stepName: 'element',
		condition: {
			conditionType: ConditionEnum.MAXLEVEL,
			value: 80
		},
		nextStep: ['fire', 'water', 'lightning', 'wood', 'air']
	},
	fire: {
		stepName: 'fire',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.FIRE
			}
		]
	},
	water: {
		stepName: 'water',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.WATER
			}
		]
	},
	lightning: {
		stepName: 'lightning',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.LIGHTNING
			}
		]
	},
	wood: {
		stepName: 'wood',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.WOOD
			}
		]
	},
	air: {
		stepName: 'air',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.CHANGE_ELEMENT,
				value: ElementType.AIR
			}
		]
	},
	world: {
		stepName: 'world',
		nextStep: [
			'nothing',
			'GO_TO_GRAND_TOUT_CHAUD',
			'GO_TO_ATLANTEINES_ISLAND',
			'CIMETIERE',
			'GO_TO_DINOPLAZA',
			'GO_TO_MONSTER_ISLAND',
			'GO_TO_FOREST',
			'GO_TO_DOME_SOULAFLOTTE',
			'GO_TO_TUNNEL',
			'JUNGLE_SAUVAGE',
			'GO_TO_STEPPES'
		]
	},
	nothing: {
		stepName: 'nothing',
		nextStep: ['back']
	},
	GO_TO_GRAND_TOUT_CHAUD: {
		stepName: 'GO_TO_GRAND_TOUT_CHAUD',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'CLIMBING_GEAR',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'CLIMBING_GEAR'
			}
		]
	},
	GO_TO_ATLANTEINES_ISLAND: {
		stepName: 'GO_TO_ATLANTEINES_ISLAND',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'BUOY',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'BUOY'
			}
		]
	},
	CIMETIERE: {
		stepName: 'CIMETIERE',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'SKULLY_MEMORY',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'SKULLY_MEMORY'
			}
		]
	},
	GO_TO_DINOPLAZA: {
		stepName: 'GO_TO_DINOPLAZA',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'DINOPLAZA',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'DINOPLAZA'
			}
		]
	},
	GO_TO_MONSTER_ISLAND: {
		stepName: 'GO_TO_MONSTER_ISLAND',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'JOVEBOZE',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'JOVEBOZE'
			}
		]
	},
	GO_TO_FOREST: {
		stepName: 'GO_TO_FOREST',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'NENUPHAR_LEAF',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'NENUPHAR_LEAF'
			}
		]
	},
	GO_TO_DOME_SOULAFLOTTE: {
		stepName: 'GO_TO_DOME_SOULAFLOTTE',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'RASCAPHANDRE_DECOY',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'RASCAPHANDRE_DECOY'
			}
		]
	},
	GO_TO_TUNNEL: {
		stepName: 'GO_TO_TUNNEL',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'LANTERN',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'LANTERN'
			}
		]
	},
	JUNGLE_SAUVAGE: {
		stepName: 'JUNGLE_SAUVAGE',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'FLIPPERS',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'FLIPPERS'
			}
		]
	},
	GO_TO_STEPPES: {
		stepName: 'GO_TO_STEPPES',
		nextStep: ['back'],
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: 'SYLVENOIRE_KEY',
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: 'SYLVENOIRE_KEY'
			}
		]
	},
	experience: {
		stepName: 'experience',
		condition: {
			conditionType: ConditionEnum.MAXLEVEL,
			value: 80
		},
		nextStep: ['maxExperience']
	},
	maxExperience: {
		stepName: 'maxExperience',
		nextStep: ['back'],
		reward: [
			{
				rewardType: RewardEnum.MAXEXPERIENCE,
				value: 1
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
