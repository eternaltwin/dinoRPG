import { RaceEnum } from '../enums/RaceEnum.mjs';

export interface demonShopFiche {
	dinoz: demonDinozFiche[];
	sacrificed: demonDinozFiche[];
	shop: demonDinozFiche[];
}

export interface demonDinozFiche {
	id: number;
	level: number;
	display: string;
	raceId: RaceEnum;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	skills: number[];
	// unlockable skills?
	price: number;
}
