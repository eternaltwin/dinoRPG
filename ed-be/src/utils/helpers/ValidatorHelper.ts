const allValuesAreNumber = <T>(value: T[]): boolean => {
	return value.every(val => typeof val === 'number');
};

export const isJson = (str: string): boolean => {
	try {
		JSON.parse(str);
		return true;
	} catch (err) {
		return false;
	}
};

export { allValuesAreNumber };
