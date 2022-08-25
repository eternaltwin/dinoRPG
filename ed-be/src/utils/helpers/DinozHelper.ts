import { DinozRace } from '../../models/index.js';

export const getRandomUpElement = (race: DinozRace): number | undefined => {
	const randomNumber: number = Math.ceil(Math.random() * 20);
	let total: number = 0;

	for (const [index, elementValue] of Object.values(race.upChance!).entries()) {
		total += elementValue;
		if (randomNumber <= total) {
			return index + 1;
		}
	}
};
