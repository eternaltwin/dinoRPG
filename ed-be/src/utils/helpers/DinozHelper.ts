import { UpChance } from '../../models/index.js';

export const getRandomUpElement = (raceUpChance: UpChance): number | undefined => {
	const totalUpChance: number = Object.values(raceUpChance).reduce((total, currentValue) => total + currentValue, 0);
	const randomNumber: number = Math.ceil(Math.random() * totalUpChance);
	let total: number = 0;

	for (const [index, elementValue] of Object.values(raceUpChance!).entries()) {
		total += elementValue;
		if (randomNumber <= total) {
			return index + 1;
		}
	}
};
