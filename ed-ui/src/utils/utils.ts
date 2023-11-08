export const utils = {
	/**
	 * Ajoute des espaces tous les trois caractères
	 * ex: 93000 -> 93 000
	 */
	beautifulNumber(number: string): string {
		let newNumber = '';
		for (let i = 0; i < number.length; i++) {
			if (i % 3 === 0 && i !== 0) {
				newNumber += ' ';
			}
			newNumber += number[number.length - 1 - i];
		}
		return newNumber.split('').reverse().join('');
	},
	/**
	 * Shuffle an array
	 * @param array
	 * @returns A suffled copy of the array
	 */
	shuffle: <T>(array: Array<T>) => {
		const shuffledArray = [...array];
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
		}

		return shuffledArray;
	}
};
