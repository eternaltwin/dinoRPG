import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { MapZone } from '@drpg/core/models/enums/MapZone';

export const bossList: Readonly<Record<string, MonsterFiche>> = {
	GARDIEN_TOUR: {
		name: 'towgrd',
		hp: 300,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		gold: 1000,
		xp: 40,
		odds: 1,
		level: 30,
		zone: MapZone.DARKWORLD
	},
	ELEMENTAIRE_FEU: {
		name: 'efire',
		hp: 60,
		elements: {
			fire: 4,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		gold: 1000,
		xp: 50,
		odds: 1,
		level: 5,
		zone: MapZone.DARKWORLD
	},
	ELEMENTAIRE_EAU: {
		name: 'ewater',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 4,
			lightning: 0,
			air: 0
		},
		gold: 1000,
		xp: 50,
		odds: 1,
		level: 5,
		zone: MapZone.DARKWORLD
	},
	RASCAPHANDRE: {
		name: 'rasca',
		hp: 60,
		elements: {
			fire: 1,
			wood: 2,
			water: 8,
			lightning: 1,
			air: 2
		},
		gold: 1000,
		xp: 100,
		odds: 1,
		level: 10,
		zone: MapZone.ILES
	},
	ELEMENTAIRE_TERRE: {
		name: 'eearth',
		hp: 100,
		elements: {
			fire: 2,
			wood: 8,
			water: 2,
			lightning: 2,
			air: 2
		},
		gold: 1000,
		xp: 100,
		odds: 1,
		level: 10,
		zone: MapZone.ILES
	}
};
