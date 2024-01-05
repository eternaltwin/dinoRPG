import { MapZone } from '../enums/MapZone.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { MonsterFiche } from './MonsterFiche.mjs';

export const monsterList: Readonly<Record<string, MonsterFiche>> = {
	// This monster is here to always have an enemy to fight
	JOKERPIGNON: {
		name: 'goupignon',
		hp: 10,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 1,
		level: 1,
		zone: MapZone.ALL
	},
	GOUPIGNON: {
		name: 'goupignon',
		hp: 10,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 100,
		level: 1,
		zone: MapZone.DINOLAND
	},
	WOLF: {
		name: 'wolf',
		hp: 15,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 1,
		bonus_defense: 1,
		odds: 80,
		level: 5,
		zone: MapZone.DINOLAND,
		groups: [5, 3, 1]
	},
	GLUON: {
		name: 'gluon',
		hp: 35,
		elements: {
			air: 2,
			fire: 2,
			lightning: 2,
			water: 2,
			wood: 2
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 20,
		level: 7,
		zone: MapZone.DINOLAND
	},
	GREEN_GIANT: {
		name: 'greeng',
		hp: 70,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 3,
		bonus_defense: 6,
		odds: 100,
		level: 14,
		zone: MapZone.DINOLAND
	},
	COQ: {
		name: 'coq',
		hp: 80,
		elements: {
			air: 3,
			fire: 3,
			lightning: 3,
			water: 3,
			wood: 3
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 50,
		level: 21,
		zone: MapZone.DINOLAND
	},
	PIRASK: {
		name: 'pirask',
		hp: 15,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 30,
		odds: 50,
		level: 15,
		zone: MapZone.DINOLAND,
		place: PlaceEnum.CIMETIERE,
		groups: [0, 0, 1]
	},
	FLAM: {
		name: 'flam',
		hp: 10,
		elements: {
			fire: 1,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 100,
		level: 3,
		zone: MapZone.GTOUTCHAUD,
		groups: [0, 3, 1]
	},
	GOBLIN: {
		name: 'goblin',
		hp: 60,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 2,
		bonus_defense: 1,
		odds: 100,
		level: 5,
		zone: MapZone.GTOUTCHAUD
	},
	BARCHE: {
		name: 'barche',
		hp: 70,
		elements: {
			fire: 3,
			wood: 1,
			water: 2,
			lightning: 1,
			air: 1
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 20,
		level: 10,
		zone: MapZone.GTOUTCHAUD
	},
	COBRA: {
		name: 'cobra',
		hp: 100,
		elements: {
			fire: 5,
			wood: 0,
			water: 0,
			lightning: 4,
			air: 0
		},
		odds: 50,
		level: 20,
		zone: MapZone.GTOUTCHAUD
	},
	PIRA: {
		name: 'pira',
		hp: 5,
		elements: {
			fire: 0,
			wood: 0,
			water: 1,
			lightning: 0,
			air: 0
		},
		odds: 100,
		level: 6,
		zone: MapZone.ILES,
		groups: [0, 0, 1]
	},
	KAZKA: {
		name: 'kazka',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 3,
		bonus_defense: 7,
		odds: 50,
		level: 8,
		zone: MapZone.ILES
	},
	ANGUIL: {
		name: 'anguil',
		hp: 120,
		elements: {
			fire: 2,
			wood: 0,
			water: 4,
			lightning: 0,
			air: 0
		},
		odds: 70,
		level: 18,
		zone: MapZone.ILES
	},
	BORG: {
		name: 'borg',
		hp: 100,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 40,
		odds: 50,
		level: 28,
		zone: MapZone.ILES
	},
	KORGON: {
		name: 'korgon',
		hp: 10,
		elements: {
			fire: 3,
			wood: 4,
			water: 0,
			lightning: 0,
			air: 0
		},
		odds: 100,
		level: 7,
		zone: MapZone.JUNGLE,
		groups: [0, 2, 1]
	},
	RONCIV: {
		name: 'ronciv',
		hp: 70,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 6,
		bonus_defense: 15,
		odds: 100,
		level: 15,
		zone: MapZone.JUNGLE
	},
	BAT: {
		name: 'bat',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 25,
		bonus_defense: 18,
		odds: 50,
		level: 20,
		zone: MapZone.JUNGLE
	},
	GRDIEN: {
		name: 'grdien',
		hp: 80,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 25,
		odds: 50,
		level: 25,
		zone: MapZone.JUNGLE
	},
	WORM2: {
		name: 'worm2',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 6,
		bonus_defense: 10,
		odds: 50,
		level: 20,
		zone: MapZone.STEPPE
	},
	WORM: {
		name: 'worm',
		hp: 60,
		elements: {
			fire: 0,
			wood: 0,
			water: 10,
			lightning: 15,
			air: 0
		},
		odds: 50,
		level: 30,
		zone: MapZone.STEPPE
	},
	SCORP: {
		name: 'scorp',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 9,
			air: 0
		},
		odds: 50,
		level: 30,
		zone: MapZone.STEPPE
	},
	CACTUS: {
		name: 'cactus',
		hp: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 130,
		odds: 50,
		level: 38,
		zone: MapZone.STEPPE
	},
	BRIG1_ALL: {
		name: 'brig1',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 70,
		bonus_defense: 0,
		odds: 10,
		level: 25,
		zone: MapZone.STEPPE,
		groups: [0, 1]
	},
	BRIG1_HOME: {
		name: 'brig1',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 70,
		bonus_defense: 0,
		odds: 500,
		level: 25,
		zone: MapZone.STEPPE,
		place: PlaceEnum.TAUDIS_DES_ZAXA,
		groups: [0, 1]
	},
	BRIG2_ALL: {
		name: 'brig2',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 10,
		level: 25,
		zone: MapZone.STEPPE,
		groups: [0, 0, 0, 1]
	},
	BRIG2_HOME: {
		name: 'brig2',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 500,
		level: 25,
		zone: MapZone.STEPPE,
		place: PlaceEnum.CAMP_DES_EMMEMMA,
		groups: [0, 0, 0, 1]
	},
	BRIG3_ALL: {
		name: 'brig3',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 20,
		odds: 10,
		level: 25,
		zone: MapZone.STEPPE,
		groups: [0, 0, 1]
	},
	BRIG3_HOME: {
		name: 'brig3',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 20,
		odds: 500,
		level: 25,
		zone: MapZone.STEPPE,
		place: PlaceEnum.CAMPEMENT_DES_MATTMUT,
		groups: [0, 0, 1]
	},
	GROPI: {
		name: 'gropi',
		hp: 10,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 15,
		bonus_defense: 25,
		odds: 100,
		level: 7,
		zone: MapZone.DINOWEST
	},
	MIMIC: {
		name: 'mimic',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 30,
		bonus_defense: 50,
		odds: 100,
		level: 35,
		zone: MapZone.DINOWEST
	},
	EARTH2: {
		name: 'earth2',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 40,
		odds: 100,
		level: 15,
		zone: MapZone.DINOWEST
	},
	ANY: {
		name: 'any',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 40,
		odds: 1,
		level: 100,
		zone: MapZone.NOWHERE
	}
};
