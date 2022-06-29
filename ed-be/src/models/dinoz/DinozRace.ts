export interface DinozRace {
	raceId: number;
	isDemon: boolean;
	name: string;
	nbrFire: number;
	nbrWood: number;
	nbrWater: number;
	nbrLightning: number;
	nbrAir: number;
	// Chances are in x out of 20
	// e.g. 5 means 5 chances of out 20 to get that element, i.e 25 %
	upChance: {
		fire: number;
		wood: number;
		water: number;
		lightning: number;
		air: number;
	};
	price: number;
	swfLetter: string;
	display?: Record<number, string>;
	skillId?: Array<number>;
}
