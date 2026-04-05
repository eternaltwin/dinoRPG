/**
 * Possible Frontmatter metadata fields.
 * If you need a new field, at it here with matching name.
 */ 
export interface MarkdownMetadata {
	order?: number;
	icon?: {
		path: string;
		name: string;
	};
}

export interface MarkdownWithMetadata {
	id: string;
	content: string;
	metadata: MarkdownMetadata;
}

/**
 * Extracts YAML frontmatter from markdown content
 * Frontmatter format:
 * ---
 * key: value
 * ---
 */
function extractFrontmatter(markdown: string): { metadata: MarkdownMetadata; content: string } {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = markdown.match(frontmatterRegex);

	if (!match) {
		return { metadata: {}, content: markdown };
	}

	const frontmatterText = match[1];
	const content = match[2];

	// Simple YAML parser for our use case
	const metadata: MarkdownMetadata = {};
	const lines = frontmatterText.split('\n');

	let currentKey: string | null = null;
	let currentObject: Record<string, string> | null = null;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// Check if it's a nested property (starts with whitespace)
		if (line.startsWith('  ') && currentKey && currentObject) {
			const [key, value] = trimmed.split(':').map(s => s.trim());
			currentObject[key] = value;
		} else {
			// Top-level property
			const [key, value] = trimmed.split(':').map(s => s.trim());
			currentKey = key;

			if (!value) {
				// It's an object, prepare to receive nested properties
				currentObject = {};
				if (key === 'icon') {
					metadata.icon = currentObject as { path: string; name: string };
				}
			} else {
				currentObject = null;
				// Convert order to number if it's the order field
				if (key === 'order') {
					metadata.order = parseInt(value, 10);
				}
			}
		}
	}

	return { metadata, content };
}

/**
 * Loads all markdown files from the helpPages folder.
 * Uses Vite's import.meta.glob to discover and load all .md files.
 * 
 * The ID and order information of the help page are contained in its name.
 * Other metadata (like icon and path) is stored in the frontmatter of the markdown file.
 *
 * @param language - The language code (e.g., 'en', 'fr')
 * @returns Array of markdown files with their id, metadata and content
 */
export async function loadAllHelpPages(language: string): Promise<MarkdownWithMetadata[]> {
	const defaultLanguage = 'fr';

	try {
		// Load all markdown files from all language folders
		// Pattern is relative to the file where import.meta.glob is called
		const allModules = import.meta.glob<{ default: string }>('../i18n/helpPages/**/*.md', {
			query: '?raw',
			eager: false
		});

		// Filter for the specific language
		const pathPattern = `/helpPages/${language}/`;
		const filteredModules: Record<string, () => Promise<{ default: string }>> = {};

		for (const [path, loader] of Object.entries(allModules)) {
			if (path.includes(pathPattern)) {
				filteredModules[path] = loader;
			}
		}

		// If no files found for the requested language, fall back to default
		if (Object.keys(filteredModules).length === 0 && language !== defaultLanguage) {
			const defaultPattern = `/helpPages/${defaultLanguage}/`;
			for (const [path, loader] of Object.entries(allModules)) {
				if (path.includes(defaultPattern)) {
					filteredModules[path] = loader;
				}
			}
			console.log(`Fallback to ${defaultLanguage}:`, Object.keys(filteredModules));
		}

		const pages: MarkdownWithMetadata[] = [];

		for (const [path, loader] of Object.entries(filteredModules)) {
			try {
				// Extract the filename (without extension) as the ID
				const filename = path.split('/').pop()?.replace('.md', '') || '';

				// Parse the numeric prefix and the slug separately
				const match = filename.match(/^(\d+)-(.+)$/);
				const order = match ? parseInt(match[1], 10) : undefined;
				const id = match ? match[2] : filename;

				// Load the module
				const module = await loader();
				const rawContent = module.default;

				// Extract frontmatter and content
				const { metadata, content } = extractFrontmatter(rawContent);
				metadata.order = order;

				pages.push({
					id,
					metadata,
					content
				});
			} catch (error) {
				console.error(`Error loading ${path}:`, error);
			}
		}

		return pages;
	} catch (error) {
		console.error('Error in loadAllHelpPages:', error);
		return [];
	}
}

/**
 * Loads a single markdown file for a specific folder and language
 * Falls back to French if the requested language file is not found
 *
 * @param parentFolder - The base name of the parent folder that contains the markdown files
 * @param markdownFile - The base name of the markdown file (e.g., 'intro')
 * @param language - The language code (e.g., 'en', 'fr')
 * @returns The markdown content and metadata
 */
export async function loadMarkdownPage(
	parentFolder: string,
	markdownFile: string,
	language: string
): Promise<MarkdownWithMetadata> {
	const defaultLanguage = 'fr';

	try {
		// Try to load the requested language
		const module = await import(`../i18n/${parentFolder}/${language}/${markdownFile}.md?raw`);
		const { metadata, content } = extractFrontmatter(module.default);
		return { id: markdownFile, content, metadata };
	} catch (error) {
		// If the requested language fails, fall back to French
		if (language !== defaultLanguage) {
			try {
				const module = await import(`../i18n/${parentFolder}/${defaultLanguage}/${markdownFile}.md?raw`);
				const { metadata, content } = extractFrontmatter(module.default);
				return { id: markdownFile, content, metadata };
			} catch (fallbackError) {
				console.error(
					`Failed to load fallback markdown file: ${parentFolder}/${defaultLanguage}/${markdownFile}.md`,
					fallbackError
				);
				return {
					id: markdownFile,
					content: `# Error\n\nFailed to load fallback markdown: ${parentFolder}/${defaultLanguage}/${markdownFile}.md`,
					metadata: {}
				};
			}
		} else {
			console.error(`Failed to load markdown file: ${parentFolder}/${defaultLanguage}/${markdownFile}.md`, error);
			return {
				id: markdownFile,
				content: `# Error\n\nFailed to load markdown: ${parentFolder}/${defaultLanguage}/${markdownFile}.md`,
				metadata: {}
			};
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
