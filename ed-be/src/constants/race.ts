import { DinozRace } from '../models/index.js';

// If price is 0 that means the dinoz cannot be purchased via the dinoz shop.
// For a demon dinoz, the price is the number of demon tickets.
export const raceList: Record<string, DinozRace> = {
	MOUEFFE: {
		raceId: 1,
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
		swfLetter: '0',
		display: {
			0: '0',
			1: '0',
			2: '1', // HasKnee (1 = yes)
			3: '7', // Head
			4: '7', // Hair
			5: '5', // Arm
			6: '3', // Chest
			7: 'A', // Tattoo
			8: '0',
			9: 'A', // Body color
			10: '7', // Hair color
			11: 'C', // Tattoo color
			12: '0',
			13: '0',
			14: '0',
			15: '0'
		}
	},
	MOUEFFE_DEMON: {
		raceId: 2,
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
		swfLetter: '0'
	},
	PIGMOU: {
		raceId: 3,
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
		swfLetter: '1',
		display: {
			0: '1',
			1: '0',
			2: '3', // Eyes
			3: '9', // Mouth
			4: '3', // Tail
			5: '1', // hair back right leg (1 = yes)
			6: 'F', // Hair
			7: '0',
			8: '0',
			9: 'B', // Body color
			10: '8', // Tail color
			11: 'A', // Hair color
			12: '0',
			13: '0', // Special color (max = 2)
			14: '0', // Special stripe (max = 1)
			15: '0'
		}
	},
	PIGMOU_DEMON: {
		raceId: 4,
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
		swfLetter: '1'
	},
	WINKS: {
		raceId: 5,
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
		swfLetter: '2'
	},
	WINKS_DEMON: {
		raceId: 6,
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
		swfLetter: '2'
	},
	PLANAILLE: {
		raceId: 7,
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
		swfLetter: '3'
	},
	PLANAILLE_DEMON: {
		raceId: 8,
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
		swfLetter: '3'
	},
	CASTIVORE: {
		raceId: 9,
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
		swfLetter: '4'
	},
	ROCKY: {
		raceId: 10,
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
		swfLetter: '5'
	},
	PTEROZ: {
		raceId: 11,
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
		swfLetter: '6'
	},
	NUAGOZ: {
		raceId: 12,
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
		swfLetter: '7'
	},
	SIRAIN: {
		raceId: 13,
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
		swfLetter: '8'
	},
	HIPPOCLAMP: {
		raceId: 14,
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
		swfLetter: '9'
	},
	GORILLOZ: {
		raceId: 15,
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
		swfLetter: 'A'
	},
	GORILLOZ_DEMON: {
		raceId: 16,
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
		swfLetter: 'A'
	},
	WANWAN: {
		raceId: 17,
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
		swfLetter: 'B'
	},
	WANWAN_DEMON: {
		raceId: 18,
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
		swfLetter: 'B'
	},
	SANTAZ: {
		raceId: 19,
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
		price: 0,
		swfLetter: 'C'
	},
	FEROSS: {
		raceId: 20,
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
		price: 0,
		swfLetter: 'D'
	},
	KABUKI: {
		raceId: 21,
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
		price: 0,
		swfLetter: 'E'
	},
	KABUKI_DEMON: {
		raceId: 22,
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
		swfLetter: 'E'
	},
	MAHAMUTI: {
		raceId: 23,
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
		price: 0,
		swfLetter: 'F'
	},
	SOUFFLET: {
		raceId: 24,
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
		price: 0,
		swfLetter: 'G'
	},
	TOUFUFU: {
		raceId: 25,
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
		price: 0,
		swfLetter: 'H'
	},
	QUETZU: {
		raceId: 26,
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
		swfLetter: 'I'
	},
	SMOG: {
		raceId: 27,
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
		price: 0,
		swfLetter: 'J'
	},
	TRICERAGNON: {
		raceId: 28,
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
		price: 0,
		swfLetter: 'K'
	}
};

// 28 races en tout
