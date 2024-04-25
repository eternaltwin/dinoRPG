import { Skill } from '../dinoz/SkillList.mjs';
import { MapZone } from '../enums/MapZone.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { GameEvent } from '../event/Events.mjs';
import { Boss } from './BossList.mjs';
import { Monster } from './MonsterList.mjs';

export type MonsterFiche = {
	id: Monster | Boss;
	name: string;
	boss?: boolean;
	hp: number;
	elements: { air: number; fire: number; lightning: number; water: number; wood: number };
	// bonus attack for monster
	bonus_attack?: number | undefined;
	// bonus defense for monster
	bonus_defense?: number | undefined;
	// If the monster needs to use smoothed calculations
	balanced: boolean;
	groups?: groupMonster[];
	xp?: number;
	xpBonus?: number;
	gold?: number;
	// Chance of encountering this monster.
	odds: number;
	level: number;
	zones: MapZone[];
	places?: PlaceEnum[];
	special?: boolean;
	skills?: Skill[];
	canBeCaptured: boolean;
	events?: GameEvent[];
	noMove?: boolean;
	display?: string;
};

export type groupMonster = {
	quantity: number;
	odds: number;
};
