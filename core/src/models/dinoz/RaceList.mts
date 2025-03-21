// If price is 0 that means the dinoz cannot be purchased via the dinoz shop.
// For a demon dinoz, the price is the number of demon tickets.

import { DinozRace } from './DinozRace.mjs';

export enum RaceList {
	MOUEFFE = 1,
	MOUEFFE_DEMON,
	PIGMOU,
	PIGMOU_DEMON,
	WINKS,
	WINKS_DEMON,
	PLANAILLE,
	PLANAILLE_DEMON,
	CASTIVORE,
	ROCKY,
	PTEROZ,
	NUAGOZ,
	SIRAIN,
	HIPPOCLAMP,
	GORILLOZ,
	GORILLOZ_DEMON,
	WANWAN,
	WANWAN_DEMON,
	SANTAZ,
	FEROSS,
	KABUKI,
	KABUKI_DEMON,
	MAHAMUTI,
	SOUFFLET,
	TOUFUFU,
	QUETZU,
	SMOG,
	TRICERAGNON
}

export const raceList: Record<RaceList, DinozRace> = {
	[RaceList.MOUEFFE]: {
		raceId: RaceList.MOUEFFE,
		isDemon: false,
		name: 'moueffe',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 10,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 3
		},
		price: 16000,
		swfLetter: '00'
	},
	[RaceList.MOUEFFE_DEMON]: {
		raceId: RaceList.MOUEFFE_DEMON,
		isDemon: true,
		name: 'moueffe_demon',
		nbrFire: 6,
		nbrWood: 2,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 10,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 3
		},
		price: 600,
		swfLetter: '0A',
		skillId: [61114] //FORCE_DE_LUMIERE
	},
	[RaceList.PIGMOU]: {
		raceId: RaceList.PIGMOU,
		isDemon: false,
		name: 'pigmou',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 12,
			wood: 3,
			water: 2,
			lightning: 2,
			air: 1
		},
		price: 20000,
		swfLetter: '10',
		skillId: [61103] //CHARGE_CORNUE
	},
	[RaceList.PIGMOU_DEMON]: {
		raceId: RaceList.PIGMOU_DEMON,
		isDemon: true,
		name: 'pigmou_demon',
		nbrFire: 7,
		nbrWood: 1,
		nbrWater: 2,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 12,
			wood: 3,
			water: 2,
			lightning: 2,
			air: 1
		},
		price: 800,
		swfLetter: '1',
		skillId: [61115] //CHARGE_PIGMOU
	},
	[RaceList.WINKS]: {
		raceId: RaceList.WINKS,
		isDemon: false,
		name: 'winks',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 1,
			wood: 2,
			water: 9,
			lightning: 6,
			air: 2
		},
		price: 20000,
		swfLetter: '20',
		skillId: [61102] //COQUE
	},
	[RaceList.WINKS_DEMON]: {
		raceId: RaceList.WINKS_DEMON,
		isDemon: true,
		name: 'winks_demon',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 5,
		nbrLightning: 4,
		nbrAir: 1,
		upChance: {
			fire: 1,
			wood: 2,
			water: 9,
			lightning: 6,
			air: 2
		},
		price: 700,
		swfLetter: '2A',
		skillId: [61118] //DUR_A_CUIRE
	},
	[RaceList.PLANAILLE]: {
		raceId: RaceList.PLANAILLE,
		isDemon: false,
		name: 'planaille',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 0,
		upChance: {
			fire: 2,
			wood: 2,
			water: 2,
			lightning: 10,
			air: 4
		},
		price: 16000,
		swfLetter: '30'
	},
	[RaceList.PLANAILLE_DEMON]: {
		raceId: RaceList.PLANAILLE_DEMON,
		isDemon: true,
		name: 'planaille_demon',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 7,
		nbrAir: 2,
		upChance: {
			fire: 2,
			wood: 2,
			water: 2,
			lightning: 10,
			air: 4
		},
		price: 700,
		swfLetter: '3A',
		skillId: [61116] //FORCE_DES_TENEBRES
	},
	[RaceList.CASTIVORE]: {
		raceId: RaceList.CASTIVORE,
		isDemon: false,
		name: 'castivore',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 1,
		upChance: {
			fire: 2,
			wood: 8,
			water: 3,
			lightning: 2,
			air: 5
		},
		price: 16000,
		swfLetter: '40'
	},
	[RaceList.ROCKY]: {
		raceId: RaceList.ROCKY,
		isDemon: false,
		name: 'rocky',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 4,
			wood: 2,
			water: 2,
			lightning: 11,
			air: 1
		},
		price: 18000,
		swfLetter: '50',
		skillId: [61104] //ROCK
	},
	[RaceList.PTEROZ]: {
		raceId: RaceList.PTEROZ,
		isDemon: false,
		name: 'pteroz',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 3,
		upChance: {
			fire: 8,
			wood: 2,
			water: 1,
			lightning: 3,
			air: 6
		},
		price: 22000,
		swfLetter: '60'
	},
	[RaceList.NUAGOZ]: {
		raceId: RaceList.NUAGOZ,
		isDemon: false,
		name: 'nuagoz',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 1,
			wood: 1,
			water: 6,
			lightning: 6,
			air: 6
		},
		price: 16000,
		swfLetter: '70'
	},
	[RaceList.SIRAIN]: {
		raceId: RaceList.SIRAIN,
		isDemon: false,
		name: 'sirain',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 2,
			water: 11,
			lightning: 2,
			air: 2
		},
		price: 16000,
		swfLetter: '80'
	},
	[RaceList.HIPPOCLAMP]: {
		raceId: RaceList.HIPPOCLAMP,
		isDemon: false,
		name: 'hippoclamp',
		nbrFire: 1,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 4,
			wood: 4,
			water: 4,
			lightning: 4,
			air: 4
		},
		price: 28000,
		swfLetter: '90'
	},
	[RaceList.GORILLOZ]: {
		raceId: RaceList.GORILLOZ,
		isDemon: false,
		name: 'gorilloz',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 13,
			water: 1,
			lightning: 2,
			air: 1
		},
		price: 16000,
		swfLetter: 'A0'
	},
	[RaceList.GORILLOZ_DEMON]: {
		raceId: RaceList.GORILLOZ_DEMON,
		isDemon: true,
		name: 'gorilloz_demon',
		nbrFire: 1,
		nbrWood: 8,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 13,
			water: 1,
			lightning: 2,
			air: 1
		},
		price: 700,
		swfLetter: 'AA',
		skillId: [61111] //GROS_COSTAUD
	},
	[RaceList.WANWAN]: {
		raceId: RaceList.WANWAN,
		isDemon: false,
		name: 'wanwan',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 6,
			water: 1,
			lightning: 8,
			air: 2
		},
		price: 19000,
		swfLetter: 'B0'
	},
	[RaceList.WANWAN_DEMON]: {
		raceId: RaceList.WANWAN_DEMON,
		isDemon: true,
		name: 'wanwan_demon',
		nbrFire: 1,
		nbrWood: 3,
		nbrWater: 1,
		nbrLightning: 5,
		nbrAir: 1,
		upChance: {
			fire: 2,
			wood: 6,
			water: 1,
			lightning: 8,
			air: 2
		},
		price: 900,
		swfLetter: 'BA',
		skillId: [61101] //FRENESIE_COLLECTIVE
	},
	[RaceList.SANTAZ]: {
		raceId: RaceList.SANTAZ,
		isDemon: false,
		name: 'santaz',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 2,
		upChance: {
			fire: 1,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 12
		},
		price: 35000,
		swfLetter: 'C0',
		skillId: [61105] //PIETINEMENT
	},
	[RaceList.FEROSS]: {
		raceId: RaceList.FEROSS,
		isDemon: false,
		name: 'feross',
		nbrFire: 1,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 6,
			wood: 6,
			water: 6,
			lightning: 1,
			air: 1
		},
		price: 35000,
		swfLetter: 'D0',
		skillId: [61106] //CUIRASSE
	},
	[RaceList.KABUKI]: {
		raceId: RaceList.KABUKI,
		isDemon: false,
		name: 'kabuki',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 3,
		upChance: {
			fire: 2,
			wood: 2,
			water: 6,
			lightning: 2,
			air: 8
		},
		price: 35000,
		swfLetter: 'E0',
		skillId: [61107] //INSAISISSABLE
	},
	[RaceList.KABUKI_DEMON]: {
		raceId: RaceList.KABUKI_DEMON,
		isDemon: true,
		name: 'kabuki_demon',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 4,
		nbrLightning: 1,
		nbrAir: 7,
		upChance: {
			fire: 2,
			wood: 2,
			water: 6,
			lightning: 2,
			air: 8
		},
		price: 800,
		swfLetter: 'EA',
		skillId: [61107, 61112] // INSAISISSABLE & ORIGINE_CAUSHEMESHENNE
	},
	[RaceList.MAHAMUTI]: {
		raceId: RaceList.MAHAMUTI,
		isDemon: false,
		name: 'mahamuti',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 1,
			wood: 8,
			water: 8,
			lightning: 2,
			air: 1
		},
		price: 35000,
		swfLetter: 'F0',
		skillId: [61113] //ECRASEMENT
	},
	[RaceList.SOUFFLET]: {
		raceId: RaceList.SOUFFLET,
		isDemon: false,
		name: 'soufflet',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 2,
		upChance: {
			fire: 0,
			wood: 4,
			water: 4,
			lightning: 4,
			air: 8
		},
		price: 35000,
		swfLetter: 'G0',
		skillId: [61109] //NAPOMAGICIEN
	},
	[RaceList.TOUFUFU]: {
		raceId: RaceList.TOUFUFU,
		isDemon: false,
		name: 'toufufu',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 0,
		upChance: {
			fire: 2,
			wood: 6,
			water: 1,
			lightning: 6,
			air: 5
		},
		price: 35000,
		swfLetter: 'H0',
		skillId: [61108] //DEPLACEMENT_INSTANTANE
	},
	[RaceList.QUETZU]: {
		raceId: RaceList.QUETZU,
		isDemon: false,
		name: 'quetzu',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 8,
			wood: 2,
			water: 8,
			lightning: 2,
			air: 0
		},
		price: 35000,
		swfLetter: 'I0'
	},
	[RaceList.SMOG]: {
		raceId: RaceList.SMOG,
		isDemon: false,
		name: 'smog',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 2,
		upChance: {
			fire: 2,
			wood: 0,
			water: 4,
			lightning: 8,
			air: 6
		},
		price: 35000,
		swfLetter: 'J0'
	},
	[RaceList.TRICERAGNON]: {
		raceId: RaceList.TRICERAGNON,
		isDemon: false,
		name: 'triceragnon',
		nbrFire: 2,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 8,
			wood: 8,
			water: 0,
			lightning: 2,
			air: 2
		},
		price: 35000,
		swfLetter: 'K0',
		skillId: [61117] //BIGMAGNON
	}
};

// 28 races en tout
