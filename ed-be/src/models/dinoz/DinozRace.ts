export interface DinozRace {
	raceId: number;
	isDemon: boolean;
	name: string;
	nbrFire: number;
	nbrWood: number;
	nbrWater: number;
	nbrLight: number;
	nbrAir: number;
	// Chances are in x out of 20
	// e.g. 5 means 5 chances of out 20 to get that element, i.e 25 %
	upFireChance: number;
	upWoodChance: number;
	upWaterChance: number;
	upLightChance: number;
	upAirChance: number;
	price: number;
	swfLetter: string;
	skillId: Array<number>;
	display?: { [letterNumber: number]: string };
}
