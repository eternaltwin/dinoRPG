import { RaceEnum } from '../enums/RaceEnum.mjs';
import { Condition } from '../npc/NpcConditions.mjs';
import { Skill } from './SkillList.mjs';

export interface DinozRace {
	raceId: RaceEnum;
	demon?: {
		// Price in demon tickets
		price: number;
		// Condition to unlock demon variant
		condition?: Condition;
	};
	name: string;
	// Initial elements
	nbrFire: number;
	nbrWood: number;
	nbrWater: number;
	nbrLightning: number;
	nbrAir: number;
	// Chances are in x out of 20
	// e.g. 5 means 5 chances of out 20 to get that element, i.e 25 %
	upChance: UpChance;
	// Price in regular tamer shop
	price: number;
	swfLetter: string;
	// Race specific skills
	skills?: Skill[];
}

export interface UpChance {
	fire: number;
	wood: number;
	water: number;
	lightning: number;
	air: number;
}
