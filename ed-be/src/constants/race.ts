import { DinozRace } from '../models';
import { skillList } from './index.js';

export const raceList = {
	WINKS: {
		raceId: 1,
		name: 'winks',
		nbrFireCase: 0,
		nbrWoodCase: 0,
		nbrWaterCase: 1,
		nbrLightCase: 1,
		nbrAirCase: 0,
		price: 20000,
		swfLetter: '2',
		skillId: 61102
	},
	SIRAIN: {
		raceId: 2,
		name: 'sirain',
		nbrFireCase: 0,
		nbrWoodCase: 0,
		nbrWaterCase: 2,
		nbrLightCase: 0,
		nbrAirCase: 0,
		price: 16000,
		swfLetter: '8'
	},
	CASTIVORE: {
		raceId: 3,
		name: 'castivore',
		nbrFireCase: 0,
		nbrWoodCase: 1,
		nbrWaterCase: 0,
		nbrLightCase: 0,
		nbrAirCase: 1,
		price: 16000,
		swfLetter: '4'
	},
	NUAGOZ: {
		raceId: 4,
		name: 'nuagoz',
		nbrFireCase: 0,
		nbrWoodCase: 0,
		nbrWaterCase: 0,
		nbrLightCase: 1,
		nbrAirCase: 1,
		price: 16000,
		swfLetter: '7'
	},
	GORILLOZ: {
		raceId: 5,
		name: 'gorilloz',
		nbrFireCase: 0,
		nbrWoodCase: 2,
		nbrWaterCase: 0,
		nbrLightCase: 0,
		nbrAirCase: 0,
		price: 16000,
		swfLetter: 'A'
	},
	WANWAN: {
		raceId: 6,
		name: 'wanwan',
		nbrFireCase: 0,
		nbrWoodCase: 1,
		nbrWaterCase: 0,
		nbrLightCase: 1,
		nbrAirCase: 0,
		price: 19000,
		swfLetter: 'B'
	},
	PIGMOU: {
		raceId: 7,
		name: 'pigmou',
		nbrFireCase: 2,
		nbrWoodCase: 0,
		nbrWaterCase: 0,
		nbrLightCase: 0,
		nbrAirCase: 0,
		price: 20000,
		swfLetter: '1',
		skillId: 61103
	},
	PLANAILLE: {
		raceId: 8,
		name: 'planaille',
		nbrFireCase: 0,
		nbrWoodCase: 0,
		nbrWaterCase: 0,
		nbrLightCase: 2,
		nbrAirCase: 0,
		price: 16000,
		swfLetter: '3'
	},
	MOUEFFE: {
		raceId: 9,
		name: 'moueffe',
		nbrFireCase: 2,
		nbrWoodCase: 0,
		nbrWaterCase: 0,
		nbrLightCase: 0,
		nbrAirCase: 0,
		price: 16000,
		swfLetter: '0'
	},
	// TODO : mettre les bonnes données pour les races ci-dessous
	ROCKY: {
		raceId: 10,
		name: 'rocky',
		nbrFireCase: 0,
		nbrWoodCase: 0,
		nbrWaterCase: 0,
		nbrLightCase: 1,
		nbrAirCase: 0,
		price: 16000,
		swfLetter: '0',
		skillId: 61104
	},
	HIPPOCLAMP: {
		raceId: 11,
		name: 'hippoclamp',
		nbrFireCase: 1,
		nbrWoodCase: 1,
		nbrWaterCase: 1,
		nbrLightCase: 1,
		nbrAirCase: 1,
		price: 16000,
		swfLetter: '0'
	},
	PTEROZ: {
		raceId: 12,
		name: 'pteroz',
		nbrFireCase: 0,
		nbrWoodCase: 0,
		nbrWaterCase: 0,
		nbrLightCase: 0,
		nbrAirCase: 3,
		price: 16000,
		swfLetter: '0'
	},
	QUETZU: {
		raceId: 14,
		name: 'quetzu',
		nbrFireCase: 2,
		nbrWoodCase: 0,
		nbrWaterCase: 0,
		nbrLightCase: 0,
		nbrAirCase: 0,
		price: 16000,
		swfLetter: '0'
	}
} as { [name: string]: DinozRace };

// 21 races en tout
