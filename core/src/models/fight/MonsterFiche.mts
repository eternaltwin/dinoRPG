import { MapZone } from '../enums/MapType.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';

export type MonsterFiche = {
	name: string;
	hp: number;
	attack: number;
	xp: number;
	gold: number;
	// Chance of encountering this monster.
	odds: number;
	level: number;
	zone: MapZone;
	place?: PlaceEnum;
};
