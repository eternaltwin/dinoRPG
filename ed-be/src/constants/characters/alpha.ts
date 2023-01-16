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
		condition: '!level(80)',
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
			'status(CLIMBING_GEAR)+status(BUOY)+status(SKULLY_MEMORY)+status(DINOPLAZA)+status(JOVEBOZE)+status(NENUPHAR_LEAF)+status(RASCAPHANDRE_DECOY)+status(LANTERN)+status(FLIPPERS)+status(SYLVENOIRE_KEY)'
	},
	GO_TO_GRAND_TOUT_CHAUD: {
		stepName: 'GO_TO_GRAND_TOUT_CHAUD',
		nextStep: ['back'],
		condition: '!status(CLIMBING_GEAR)',
		reward: ['status(CLIMBING_GEAR)']
	},
	GO_TO_ATLANTEINES_ISLAND: {
		stepName: 'GO_TO_ATLANTEINES_ISLAND',
		nextStep: ['back'],
		condition: '!status(BUOY)',
		reward: ['status(BUOY)']
	},
	CIMETIERE: {
		stepName: 'CIMETIERE',
		nextStep: ['back'],
		condition: '!status(SKULLY_MEMORY)',
		reward: ['status(SKULLY_MEMORY)']
	},
	GO_TO_DINOPLAZA: {
		stepName: 'GO_TO_DINOPLAZA',
		nextStep: ['back'],
		condition: '!status(DINOPLAZA)',
		reward: ['status(DINOPLAZA)']
	},
	GO_TO_MONSTER_ISLAND: {
		stepName: 'GO_TO_MONSTER_ISLAND',
		nextStep: ['back'],
		condition: '!status(JOVEBOZE)',
		reward: ['status(JOVEBOZE)']
	},
	GO_TO_FOREST: {
		stepName: 'GO_TO_FOREST',
		nextStep: ['back'],
		condition: '!status(NENUPHAR_LEAF)',
		reward: ['status(NENUPHAR_LEAF)']
	},
	GO_TO_DOME_SOULAFLOTTE: {
		stepName: 'GO_TO_DOME_SOULAFLOTTE',
		nextStep: ['back'],
		condition: '!status(RASCAPHANDRE_DECOY)',
		reward: ['status(RASCAPHANDRE_DECOY)']
	},
	GO_TO_TUNNEL: {
		stepName: 'GO_TO_TUNNEL',
		nextStep: ['back'],
		condition: '!status(LANTERN)',
		reward: ['status(LANTERN)']
	},
	JUNGLE_SAUVAGE: {
		stepName: 'JUNGLE_SAUVAGE',
		nextStep: ['back'],
		condition: '!status(FLIPPERS)',
		reward: ['status(FLIPPERS)']
	},
	GO_TO_STEPPES: {
		stepName: 'GO_TO_STEPPES',
		nextStep: ['back'],
		condition: '!status(SYLVENOIRE_KEY)',
		reward: ['status(SYLVENOIRE_KEY)']
	},
	experience: {
		stepName: 'experience',
		condition: '!level(80)',
		nextStep: ['maxExperience']
	},
	maxExperience: {
		stepName: 'maxExperience',
		nextStep: ['back'],
		reward: ['maxExp']
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
