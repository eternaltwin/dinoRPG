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

/**
 * Regex check for uuid
 * @param uuid - String to check
 * @returns `true` if the string is a uuidv4
 */
function isUUIDv4(uuid: string): boolean {
	const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidV4Regex.test(uuid);
}

/**
 * Check if all element in array are uuidv4
 * @param array - Array of string
 * @returns `true` if every element of the array are uuidv4
 */
export function areAllUUIDv4(array: string[]): boolean {
	return array.every(item => isUUIDv4(item));
}

export { allValuesAreNumber };
