import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { MapZone } from '@drpg/core/models/enums/MapZone';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

export const monsterList: Readonly<Record<string, MonsterFiche>> = {
	// This monster is here to always have an enemy to fight
	JOKERPIGNON: {
		name: 'goupignon',
		hp: 10,
		attack: 1,
		gold: 100,
		xp: 10,
		odds: 1,
		level: 1,
		zone: MapZone.ALL
	},
	GOUPIGNON: {
		name: 'goupignon',
		hp: 10,
		attack: 1,
		gold: 100,
		xp: 10,
		odds: 100,
		level: 1,
		zone: MapZone.DINOLAND
	},
	WOLF: {
		name: 'wolf',
		hp: 15,
		attack: 1,
		gold: 500,
		xp: 20,
		odds: 80,
		level: 5,
		zone: MapZone.DINOLAND
	},
	GLUON: {
		name: 'gluon',
		hp: 35,
		attack: 2,
		gold: 10000,
		xp: 25,
		odds: 20,
		level: 7,
		zone: MapZone.DINOLAND
	},
	GREEN_GIANT: {
		name: 'greeng',
		hp: 70,
		attack: 3,
		gold: 10000,
		xp: 10,
		odds: 100,
		level: 14,
		zone: MapZone.DINOLAND
	},
	COQ: {
		name: 'coq',
		hp: 80,
		attack: 3,
		gold: 10000,
		xp: 10,
		odds: 50,
		level: 21,
		zone: MapZone.DINOLAND
	},
	PIRASK: {
		name: 'pirask',
		hp: 15,
		attack: 3,
		gold: 10000,
		xp: 10,
		odds: 50,
		level: 2,
		zone: MapZone.DINOLAND,
		place: PlaceEnum.CIMETIERE
	},
	FLAM: {
		name: 'flam',
		hp: 10,
		attack: 1,
		gold: 10000,
		xp: 7,
		odds: 100,
		level: 3,
		zone: MapZone.GTOUTCHAUD
	},
	GOBLIN: {
		name: 'goblin',
		hp: 60,
		attack: 2,
		gold: 10000,
		xp: 10,
		odds: 100,
		level: 5,
		zone: MapZone.GTOUTCHAUD
	},
	BARCHE: {
		name: 'barche',
		hp: 70,
		attack: 3,
		gold: 10000,
		xp: 15,
		odds: 20,
		level: 10,
		zone: MapZone.GTOUTCHAUD
	},
	COBRA: {
		name: 'cobra',
		hp: 100,
		attack: 5,
		gold: 10000,
		xp: 10,
		odds: 50,
		level: 20,
		zone: MapZone.GTOUTCHAUD
	},
	PIRA: {
		name: 'pira',
		hp: 5,
		attack: 1,
		gold: 10000,
		xp: 5,
		odds: 100,
		level: 6,
		zone: MapZone.ILES
	},
	KAZKA: {
		name: 'kazka',
		hp: 50,
		attack: 3,
		gold: 10000,
		xp: 10,
		odds: 50,
		level: 8,
		zone: MapZone.ILES
	},
	ANGUIL: {
		name: 'anguil',
		hp: 120,
		attack: 2,
		gold: 10000,
		xp: 15,
		odds: 70,
		level: 18,
		zone: MapZone.ILES
	},
	BORG: {
		name: 'borg',
		hp: 100,
		attack: 10,
		gold: 10000,
		xp: 10,
		odds: 50,
		level: 28,
		zone: MapZone.ILES
	},
	KORGON: {
		name: 'korgon',
		hp: 10,
		attack: 3,
		gold: 10000,
		xp: 10,
		odds: 100,
		level: 7,
		zone: MapZone.JUNGLE
	},
	RONCIV: {
		name: 'ronciv',
		hp: 70,
		attack: 6,
		gold: 10000,
		xp: 10,
		odds: 100,
		level: 15,
		zone: MapZone.JUNGLE
	},
	BAT: {
		name: 'bat',
		hp: 50,
		attack: 8,
		gold: 10000,
		xp: 10,
		odds: 50,
		level: 20,
		zone: MapZone.JUNGLE
	},
	GRDIEN: {
		name: 'grdien',
		hp: 80,
		attack: 10,
		gold: 10000,
		xp: 15,
		odds: 50,
		level: 25,
		zone: MapZone.JUNGLE
	},
	WORM2: {
		name: 'worm2',
		hp: 50,
		attack: 6,
		gold: 10000,
		xp: 15,
		odds: 50,
		level: 20,
		zone: MapZone.STEPPE
	},
	WORM: {
		name: 'worm',
		hp: 60,
		attack: 10,
		gold: 10000,
		xp: 15,
		odds: 50,
		level: 30,
		zone: MapZone.STEPPE
	},
	SCORP: {
		name: 'scorp',
		hp: 50,
		attack: 9,
		gold: 10000,
		xp: 15,
		odds: 50,
		level: 30,
		zone: MapZone.STEPPE
	},
	CACTUS: {
		name: 'cactus',
		hp: 20,
		attack: 30,
		gold: 10000,
		xp: 12,
		odds: 50,
		level: 38,
		zone: MapZone.STEPPE
	},
	BRIG1_ALL: {
		name: 'brig1',
		hp: 30,
		attack: 17,
		gold: 10000,
		xp: 15,
		odds: 10,
		level: 25,
		zone: MapZone.STEPPE
	},
	BRIG1_HOME: {
		name: 'brig1',
		hp: 30,
		attack: 17,
		gold: 10000,
		xp: 15,
		odds: 500,
		level: 25,
		zone: MapZone.STEPPE,
		place: PlaceEnum.TAUDIS_DES_ZAXA
	},
	BRIG2_ALL: {
		name: 'brig2',
		hp: 30,
		attack: 17,
		gold: 10000,
		xp: 15,
		odds: 10,
		level: 25,
		zone: MapZone.STEPPE
	},
	BRIG2_HOME: {
		name: 'brig2',
		hp: 30,
		attack: 17,
		gold: 10000,
		xp: 15,
		odds: 500,
		level: 25,
		zone: MapZone.STEPPE,
		place: PlaceEnum.CAMP_DES_EMMEMMA
	},
	BRIG3_ALL: {
		name: 'brig3',
		hp: 30,
		attack: 17,
		gold: 10000,
		xp: 15,
		odds: 10,
		level: 25,
		zone: MapZone.STEPPE
	},
	BRIG3_HOME: {
		name: 'brig3',
		hp: 30,
		attack: 17,
		gold: 10000,
		xp: 15,
		odds: 500,
		level: 25,
		zone: MapZone.STEPPE,
		place: PlaceEnum.CAMPEMENT_DES_MATTMUT
	},
	GROPI: {
		name: 'gropi',
		hp: 10,
		attack: 7,
		gold: 10000,
		xp: 15,
		odds: 100,
		level: 7,
		zone: MapZone.DINOWEST
	},
	MIMIC: {
		name: 'mimic',
		hp: 30,
		attack: 30,
		gold: 10000,
		xp: 15,
		odds: 100,
		level: 35,
		zone: MapZone.DINOWEST
	},
	EARTH2: {
		name: 'earth2',
		hp: 30,
		attack: 10,
		gold: 10000,
		xp: 15,
		odds: 100,
		level: 15,
		zone: MapZone.DINOWEST
	}
};
