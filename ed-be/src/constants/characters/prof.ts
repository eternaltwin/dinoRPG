import { NpcData } from '../../models/index.js';

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
		condition: '!level(5)'
	},
	nothing2: {
		stepName: 'nothing2',
		nextStep: [],
		condition: '!level(7)+status(buoy)|status(CLIMBING_GEAR)'
	},
	learn: {
		stepName: 'learn',
		alias: 'back',
		nextStep: ['water', 'fire'],
		condition: 'level(5)+!status(buoy)+!status(CLIMBING_GEAR)'
	},
	learn_water: {
		stepName: 'learn_water',
		nextStep: ['water_fight'],
		condition: 'level(7)+!status(buoy)+status(CLIMBING_GEAR)'
	},
	learn_fire: {
		stepName: 'learn_fire',
		nextStep: ['fire_fight'],
		condition: 'level(7)+status(buoy)+!status(CLIMBING_GEAR)'
	},
	learn_done: {
		stepName: 'learn_done',
		nextStep: [],
		condition: 'status(buoy)+status(climbing_gear)'
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
		reward: ['status(buoy)']
	},
	fire_fight: {
		stepName: 'fire_fight',
		nextStep: [],
		action: 'fight(efire)',
		reward: ['status(climbing_gear)']
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
		condition: 'level(5)'
	},
	atlante: {
		stepName: 'atlante',
		nextStep: ['menu'],
		condition: 'level(8)'
	},
	stone: {
		stepName: 'stone',
		nextStep: ['stone_yes', 'stone_no'],
		condition: 'status(old_stone)'
	},
	gant: {
		stepName: 'gant',
		nextStep: ['menu'],
		condition: 'status(zors_glove)'
	},
	stone_yes: {
		stepName: 'stone_yes',
		nextStep: [],
		reward: ['!status(old_stone)', 'status(ashpouk_totem)']
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
