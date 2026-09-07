export const utils = {
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
