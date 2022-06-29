const allValuesAreNumber = <T>(value: Array<T>): boolean => {
	return value.every(val => typeof val === 'number');
};

export { allValuesAreNumber };
