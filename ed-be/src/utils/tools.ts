import seedrandom from 'seedrandom';

/**
 * @summary Return a random *float* between min and max (included)
 * @param min {number}
 * @param max {number}
 * @param rng {seedrandom} Optional random generator. Default to Math.random() if not provided.
 * @example getRandomInteger(0, 10) generates a random *float* between 0 and 10 (excluded).
 * @description Generates a random float between [min, max). Max is excluded.
 * Throws a range error is min > max.
 * @return number
 */
export function getRandomNumber(min: number, max: number, random?: seedrandom.PRNG) {
	if (min > max) throw new RangeError('min must be <= max');
	if (min === max) return min;

	const randomValue = random ? random() : Math.random();
	return randomValue * (max - min) + min;
}

/**
 * @summary Return a random *integer* between min and max (included)
 * @param min {number} Must be an integer, otherwise, closes biggest integer is picked.
 * @param max {number} Must be an integer, otherwise, closes lowest integer is picked.
 * @param rng {seedrandom} Optional random generator. Default to Math.random() if not provided.
 * @example getRandomInteger(0, 10) generates a random *integer* between 0 and 10.
 * @description Generates a random integer between [min, max]. Max is included.
 * Throws a range error is min > max.
 * @return number
 */
export function getRandomInteger(min: number, max: number, random?: seedrandom.PRNG) {
	min = Math.ceil(min);
	max = Math.floor(max);

	if (min > max) throw new RangeError('min must be <= max');
	if (min === max) return min;

	const randomValue = random ? random() : Math.random();
	return Math.floor(randomValue * (max - min + 1)) + min;
}

/**
 * @summary Return a random letter between '0' and the maximum letter provided
 * 			it must be part of '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
 * @param maxLetter {string}
 * @return string
 */
export function getRandomLetter(maxLetter: string): string {
	const allLetters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const lettersAvailable: string = allLetters.substring(0, allLetters.indexOf(maxLetter) + 1);

	return lettersAvailable[getRandomInteger(0, lettersAvailable.length - 1)];
}

/**
 * @summary Returns a random string of a given size.
 *
 * @param length {number}
 * @return string
 */
export function generateString(length: number): string {
	let result = '';
	const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(getRandomInteger(0, characters.length - 1));
		counter += 1;
	}
	return result;
}

/**
 * @summary Return the letter that corresponds to the provided index
 * 			The letter will be part of '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
 * @return string
 */
export function getLetter(index: number): string {
	const allLetters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	return allLetters[index];
}

export function fromBase62(s: string) {
	const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	let result = 0;
	for (let i = 0; i < s.length; i++) {
		const p = digits.indexOf(s[i]);
		if (p < 0) {
			return NaN;
		}
		result += p * Math.pow(digits.length, s.length - i - 1);
	}
	return result;
}

export function shuffle<T>(array: T[]): T[] {
	const shuffledArray = [...array];
	for (let i = array.length - 1; i > 0; i--) {
		const j = getRandomInteger(0, i);
		[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
	}

	return shuffledArray;
}


/**
 * @summary Return a element of an array at random
 * @param array {T[]} Array containing elements
 * @param rng {seedrandom} Optional random generator. Default to Math.random() if not provided.
 * @example getRandomArrayElement(array) picks a random element of the array.
 * @description Returns a random element of an array.
 * Throws an error if the array is empty.
 * If the array contains a single element, it is returned.
 * @return T
 */
export function getRandomArrayElement<T>(array: T[], random?: seedrandom.PRNG): T {
	if (array.length === 0) throw new Error('array cannot be empty');
	if (array.length === 1) return array[0];
	return array[getRandomInteger(0, array.length - 1, random)];
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default getRandomNumber;
