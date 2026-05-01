import seedrandom from 'seedrandom';

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (included)
 */
const randomBetween = (min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (included) using a seeded random generator
 */
export const randomBetweenSeeded = (random: seedrandom.PRNG, min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(random() * (max - min + 1) + min);
};

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (excluded)
 */
export const randomBetweenMaxExcluded = (min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(Math.random() * (max - min) + min);
};

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (excluded) using a seeded random generator
 */
export const randomBetweenMaxExcludedSeeded = (random: seedrandom.PRNG, min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(random() * (max - min) + min);
};

/**
 * INTEGERS ONLY
 *
 * Test a given stat (must be 0 and 1) using a seeded random generator.
 * Returns automatically false if stat is 0 or less.
 */
export const testStat = (random: seedrandom.PRNG, stat: number) => {
	if (stat > 0) {
		return random() < stat;
	} else {
		return false;
	}
};

export default randomBetween;
