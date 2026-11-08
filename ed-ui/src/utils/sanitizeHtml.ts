import DOMPurify from 'dompurify';

/**
 * Strips scripts, event handlers and dangerous URLs from an HTML string before it reaches `v-html`, a Tippy
 * tooltip or a toast. Game texts keep their markup (bold, icons, line breaks, links).
 */
export function sanitizeHtml(html: string | null | undefined): string {
	if (!html) return '';
	return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}
