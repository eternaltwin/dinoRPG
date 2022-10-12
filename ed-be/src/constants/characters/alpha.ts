import { NpcData } from '../../models/index.js';

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
		nextStep: ['fire', 'water', 'lightning', 'wood', 'air']
	},
	fire: {
		stepName: 'fire',
		nextStep: ['back'],
		reward: ['changeelem(fire)']
	},
	water: {
		stepName: 'water',
		nextStep: ['back'],
		reward: ['changeelem(water)']
	},
	lightning: {
		stepName: 'lightning',
		nextStep: ['back'],
		reward: ['changeelem(lightning)']
	},
	wood: {
		stepName: 'wood',
		nextStep: ['back'],
		reward: ['changeelem(wood)']
	},
	air: {
		stepName: 'air',
		nextStep: ['back'],
		reward: ['changeelem(air)']
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
		nextStep: ['back'],
		condition:
			'fx(CLIMBING_GEAR)+fx(BUOY)+fx(SKULLY_MEMORY)+fx(DINOPLAZA)+fx(JOVEBOZE)+fx(NENUPHAR_LEAF)+fx(RASCAPHANDRE_DECOY)+fx(LANTERN)+fx(FLIPPERS)+fx(SYLVENOIRE_KEY)'
	},
	GO_TO_GRAND_TOUT_CHAUD: {
		stepName: 'GO_TO_GRAND_TOUT_CHAUD',
		nextStep: ['back'],
		condition: '!fx(CLIMBING_GEAR)',
		reward: ['fx(CLIMBING_GEAR)']
	},
	GO_TO_ATLANTEINES_ISLAND: {
		stepName: 'GO_TO_ATLANTEINES_ISLAND',
		nextStep: ['back'],
		condition: '!fx(BUOY)',
		reward: ['fx(BUOY)']
	},
	CIMETIERE: {
		stepName: 'CIMETIERE',
		nextStep: ['back'],
		condition: '!fx(SKULLY_MEMORY)',
		reward: ['fx(SKULLY_MEMORY)']
	},
	GO_TO_DINOPLAZA: {
		stepName: 'GO_TO_DINOPLAZA',
		nextStep: ['back'],
		condition: '!fx(DINOPLAZA)',
		reward: ['fx(DINOPLAZA)']
	},
	GO_TO_MONSTER_ISLAND: {
		stepName: 'GO_TO_MONSTER_ISLAND',
		nextStep: ['back'],
		condition: '!fx(JOVEBOZE)',
		reward: ['fx(JOVEBOZE)']
	},
	GO_TO_FOREST: {
		stepName: 'GO_TO_FOREST',
		nextStep: ['back'],
		condition: '!fx(NENUPHAR_LEAF)',
		reward: ['fx(NENUPHAR_LEAF)']
	},
	GO_TO_DOME_SOULAFLOTTE: {
		stepName: 'GO_TO_DOME_SOULAFLOTTE',
		nextStep: ['back'],
		condition: '!fx(RASCAPHANDRE_DECOY)',
		reward: ['fx(RASCAPHANDRE_DECOY)']
	},
	GO_TO_TUNNEL: {
		stepName: 'GO_TO_TUNNEL',
		nextStep: ['back'],
		condition: '!fx(LANTERN)',
		reward: ['fx(LANTERN)']
	},
	JUNGLE_SAUVAGE: {
		stepName: 'JUNGLE_SAUVAGE',
		nextStep: ['back'],
		condition: '!fx(FLIPPERS)',
		reward: ['fx(FLIPPERS)']
	},
	GO_TO_STEPPES: {
		stepName: 'GO_TO_STEPPES',
		nextStep: ['back'],
		condition: '!fx(SYLVENOIRE_KEY)',
		reward: ['fx(SYLVENOIRE_KEY)']
	},
	experience: {
		stepName: 'experience',
		nextStep: ['maxExperience']
	},
	maxExperience: {
		stepName: 'maxExperience',
		nextStep: ['back'],
		reward: ['exp']
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
