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
 * Returns a random integer between min and max (excluded)
 */
export const randomBetweenMaxExcluded = (min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(Math.random() * (max - min) + min);
};

export default randomBetween;
