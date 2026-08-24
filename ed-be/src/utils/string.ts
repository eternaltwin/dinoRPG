/**
 * Collapses multiple consecutive spaces in the given string into a single space.
 * It also remove spaces before commas and periods.
 *
 * @param text The string in which to collapse spaces.
 * @returns The string with consecutive spaces collapsed into a single space.
 */
export function normalizeSpaces(text: string): string {
	return text.replace(/ +/g, ' ').replace(/ +([,.])/g, '$1');
}

/**
 * Removes all icons from the given string. Icons are represented in the format :icon_name:
 *
 * @param text The string from which to remove icons.
 * @returns The string with all icons removed.
 */
export function removeIcons(text: string): string {
	return normalizeSpaces(text.replace(/:[a-zA-Z0-9_]+:/g, '')).trim();
}
