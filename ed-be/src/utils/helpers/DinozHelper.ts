import { DinozRace } from '../../models/index.js';
import pkg from 'native-dinorpg';
const { randomizer } = pkg;

export const getRandomUpElement = (race: DinozRace): number | undefined => {
	const randomNumber: number = Math.ceil(randomizer());
	let total: number = 0;

	for (const [index, elementValue] of Object.values(race.upChance!).entries()) {
		total += elementValue;
		if (randomNumber <= total) {
			return index + 1;
		}
	}
};
