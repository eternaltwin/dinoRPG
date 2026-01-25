/**
 * Loads a markdown file for a specific help page section and language
 * Falls back to French if the requested language file is not found
 *
 * @param markdownFile - The base name of the markdown file (e.g., 'intro')
 * @param language - The language code (e.g., 'en', 'fr')
 * @returns The markdown content as a string
 */
export async function loadHelpPageMarkdown(
	parentFolder: string,
	markdownFile: string,
	language: string
): Promise<string> {
	const defaultLanguage = 'fr';

	try {
		// Try to load the requested language
		const module = await import(`../i18n/${parentFolder}/${markdownFile}.${language}.md?raw`);
		return module.default;
	} catch (error) {
		// If the requested language fails, fall back to French
		if (language !== defaultLanguage) {
			try {
				const module = await import(`../i18n/${parentFolder}/${markdownFile}.${defaultLanguage}.md?raw`);
				return module.default;
			} catch (fallbackError) {
				console.error(
					`Failed to load fallback markdown file: ${parentFolder}/${markdownFile}.${defaultLanguage}.md`,
					fallbackError
				);
				return `# Error\n\nFailed to load fallback markdown: ${parentFolder}/${markdownFile}.${defaultLanguage}.md`;
			}
		} else {
			console.error(`Failed to load markdown file: ${parentFolder}/${markdownFile}.${defaultLanguage}.md`, error);
			return `# Error\n\nFailed to load markdown: ${parentFolder}/${markdownFile}.${defaultLanguage}.md`;
		}
	}
}

/**
 * Processes markdown content to replace custom image syntax with actual image URLs
 * Converts: ![alt](@path/name) to <img src="..." alt="..." />
 *
 * @param markdown - The raw markdown content
 * @param getImgURL - Function to resolve image URLs (from component)
 * @returns Processed markdown with resolved image paths
 */
export function processMarkdownImages(markdown: string, getImgURL: (path: string, name: string) => string): string {
	// Match ![alt text](@path/name) pattern
	const imageRegex = /!\[([^\]]*)\]\(@([^/]+)\/([^)]+)\)/g;

	return markdown.replace(imageRegex, (match, alt, path, name) => {
		const imageUrl = getImgURL(path, name);
		return `![${alt}](${imageUrl})`;
	});
}
