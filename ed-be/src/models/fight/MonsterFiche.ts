import { MapZone, PlaceEnum } from '../enums/index.js';

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
