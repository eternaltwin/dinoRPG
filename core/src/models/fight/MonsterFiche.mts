import { Skill } from '../dinoz/SkillList.mjs';
import { MapZone } from '../enums/MapZone.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { GameEvent } from '../event/Events.mjs';
import { Boss } from './BossList.mjs';
import { Monster } from './MonsterList.mjs';
import { EntranceEffect } from './transpiler.mjs';

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
	// Resilience determines how much damage a fighter takes in.
	// Damage formula is: damage^(1-resilience*0.01)
	// So each point in resilience lowers the damage receive.
	// PVP default is 40 points so 1 - 40*0.01 = 0.6 (the original number used by MT)
	// PVE (aka monsters) is case by case
	resilience: number;
	groups?: groupMonster[];
	// Default to 10 if not provided. Set it to a different value to override.
	xp?: number;
	// Flat bonus if within 5 levels of the monster's level
	xpBonus?: number;
	gold?: number;
	// Odds of encountering this monster.
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
	// Changes the size of the sprite. 100 means unchanged.
	size?: number;
	// Gives a dark color to the monster if true.
	dark?: boolean;
	// Specifies an entrance effet for the monster.
	entrance?: EntranceEffect;
	text?: {
		entrance?: string;
		death?: string;
	};
};

export type groupMonster = {
	quantity: number;
	odds: number;
};
