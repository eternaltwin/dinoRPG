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
	}
};
