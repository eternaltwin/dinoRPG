import seedrandom from 'seedrandom';

/**
 * Test a given stat (must be between 0 and 1) using a seeded random generator.
 * Returns automatically false if stat is 0 or less.
 */
export const testStat = (random: seedrandom.PRNG, stat: number) => {
	if (stat > 0) return random() < stat;
	else return false;
};

export default testStat;
