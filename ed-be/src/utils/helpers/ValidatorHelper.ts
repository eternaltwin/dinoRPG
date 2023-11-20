const allValuesAreNumber = <T>(value: T[]): boolean => {
	return value.every(val => typeof val === 'number');
};

export { allValuesAreNumber };
