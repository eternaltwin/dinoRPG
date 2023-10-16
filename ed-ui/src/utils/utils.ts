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
	}
};
