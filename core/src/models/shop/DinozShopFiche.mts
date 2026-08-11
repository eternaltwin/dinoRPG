import { Skill } from '../dinoz/SkillList.mjs';
import { RaceEnum } from '../enums/RaceEnum.mjs';

export interface DinozShopFicheLite {
	id: number;
	display: string;
	race: RaceEnum;
}

export interface DinozShopFiche {
	id: number;
	level: number;
	display: string;
	raceId: RaceEnum;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	skills: Skill[];
	// unlockable skills?
	price: number;
}
