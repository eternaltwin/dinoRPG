import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { MapZone } from '@drpg/core/models/enums/MapZone';

export const bossList: Readonly<Record<string, MonsterFiche>> = {
	GARDIEN_TOUR: {
		name: 'towgrd',
		hp: 300,
		attack: 1,
		gold: 1000,
		xp: 40,
		odds: 1,
		level: 30,
		zone: MapZone.DARKWORLD
	},
	ELEMENTAIRE_FEU: {
		name: 'efire',
		hp: 60,
		attack: 1,
		gold: 1000,
		xp: 50,
		odds: 1,
		level: 5,
		zone: MapZone.DARKWORLD
	},
	ELEMENTAIRE_EAU: {
		name: 'ewater',
		hp: 50,
		attack: 1,
		gold: 1000,
		xp: 50,
		odds: 1,
		level: 5,
		zone: MapZone.DARKWORLD
	},
	RASCAPHANDRE: {
		name: 'rasca',
		hp: 60,
		attack: 1,
		gold: 1000,
		xp: 100,
		odds: 1,
		level: 10,
		zone: MapZone.ILES
	},
	ELEMENTAIRE_TERRE: {
		name: 'eearth',
		hp: 100,
		attack: 1,
		gold: 1000,
		xp: 100,
		odds: 1,
		level: 10,
		zone: MapZone.ILES
	}
};
