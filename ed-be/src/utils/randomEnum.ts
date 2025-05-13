/**
 * @param enumObject Enum to pick value
 * @param randomValue random
 * @returns Random value from enum
 */
export function getRandomEnumValue<T, K extends keyof T = keyof T>(enumObject: T, randomValue: number): T[K] {
	const enumValues = Object.values(enumObject as object);

	const index = Math.floor(randomValue * enumValues.length);
	return enumValues[index];
}
