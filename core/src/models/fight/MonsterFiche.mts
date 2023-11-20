import { MapZone } from '../enums/MapZone.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';

export type MonsterFiche = {
	name: string;
	hp: number;
	elements: { air: number; fire: number; lightning: number; water: number; wood: number };
	// bonus attack for monster
	bonus_attack?: number | undefined;
	// bonus defense for monster
	bonus_defense?: number | undefined;
	groups?: number[];
	xp?: number;
	xpBonus?: number;
	gold?: number;
	// Chance of encountering this monster.
	odds: number;
	level: number;
	zone: MapZone;
	place?: PlaceEnum;
	special?: boolean;
	skills?: number[];
};
